//Set up all the require packages
require("dotenv").config();
var keys = require("./keys.js");
var Spotify = require("node-spotify-api")
var spotify = new Spotify(keys.spotify);
var fs = require("fs");
var axios = require("axios");
var moment = require("moment");

process.argv[3] = process.argv.splice(3).join(" ");
console.log(process.argv[3]);
//Create a function to handle the different user statements, handle this as a switch statement (write the functions after)
function getUserCommand(commandType, commandValue) {
    switch (commandType) {
        case "concert-this":
            getConcert(commandValue);
            break;

        case "spotify-this-song":
            getSong(commandValue);
            break;

        case "movie-this":
            getMovie(commandValue);
            break;

        case "do-what-it-says":
            getLog(commandType, commandValue);
            break;

        default:
            console.log('\nInvalid Command Please Type One Of These 4 Options: \n' +
                '1."concert-this" + "artist name"\n' +
                '2."spotify-this-song" + "song name"\n' +
                '3."movie-this" + "movie name"\n' +
                '4."do-what-it-says"');
    }
}
// After a user has made a request add the command they entered to a log.txt file
    var text = process.argv[2] + ' ' + process.argv[3] + '\n';
    fs.appendFile("log.txt", text, function (err) {
        if (err) {
            console.log(err);
        }
    });
// Create functions for each command, concert-this, spotify-this-song, movie-this, do-what-it-says 
// Function for concert-this, should display the venue, location, and date of a show
function getConcert(artist) {

    axios.get("https://rest.bandsintown.com/artists/" + artist + "/events?app_id=codingbootcamp").then(function (response) {
        // If there are no concerts found, tell the user that they need to try again
        if (response.data.length === 0) {
            console.log('\nNo concerts found for this artist, please try another.\n');
        }
        //Run if found something
        for (i = 1; i < response.data.length + 1; i+=1) {
            if (response.data[i - 1].venue.region === "") {
                console.log('\n' + i + ':\nVenue: "' + response.data[i - 1].venue.name +
                    '"\nLocation: "' + response.data[i - 1].venue.city + ", " + response.data[i - 1].venue.country +
                    '"\nDate of Show: ' + moment(response.data[i - 1].datetime).format("MM/DD/YYYY") +
                     //dashes to break up answers
                    '\n---------------------------------------------');
            }
            else {
                console.log('\n' + i + '\nVenue: "' + response.data[i - 1].venue.name +
                    '"\nLocation: "' + response.data[i - 1].venue.city + ", " + response.data[i - 1].venue.region + ", " + response.data[i - 1].venue.country +
                    '"\nDate of Show: ' + moment(response.data[i - 1].datetime).format("MM/DD/YYYY") + 
                    '\n---------------------------------------------');
            }
        }
    });
}
//spotify-this-song command we should be able to see the track, album, and a link to its spotify info
function getSong(track) {
    // If there is no track listed display the default of "The Sign, by Ace of Base"
    if (track === "" || track === undefined || track === null) {
        var defaultTrack = "The Sign";
        spotify.search({ type: "track", query: defaultTrack, limit: 10 }, function (err, response) {
            if (err) {
                return console.log('It seems you have an error:: ' + err);
            }
            //the default was displaying The Sign by Ty Dolla Sign so I just hard coded the default
            console.log('---------------------------------------------\nArtist: "' + "Ace of Base" +
                '"\nTrack: "' + "The Sign" +
                '"\nAlbum: "' + "The Sign (US Album) [Remastered]" +
                '"\nLink: "' + "https://p.scdn.co/mp3-preview/4c463359f67dd3546db7294d236dd0ae991882ff?cid=731f3e4c779047e89b0f836152cd61cc" + '"\n');
        });
    }
    else {
        //run if a track is listed
        spotify.search({ type: "track", query: track, limit: 3 }, function (err, response) {
            if (err) {
                return console.log('It seems you have an error:: ' + err);
            }
            for (i = 0; i < response.tracks.items.length; i+=1) {
                // if there is no preview default a link
                if (response.tracks.items[i].preview_url === null) {
                    console.log('---------------------------------------------\nArtist: "' + response.tracks.items[i].album.artists[0].name +
                        '"\nTrack: "' + response.tracks.items[i].name +
                        '"\nAlbum: "' + response.tracks.items[i].album.name +
                        '"\nLink: "' + response.tracks.items[i].album.external_urls.spotify + '');
                }
                else {
                    console.log('---------------------------------------------\nArtist: "' + response.tracks.items[i].album.artists[0].name +
                        '"\nTrack: "' + response.tracks.items[i].name +
                        '"\nAlbum: "' + response.tracks.items[i].album.name +
                        '"\nLink: "' + response.tracks.items[i].preview_url + '"');
                }
            }
        });
    }
}
//movie-this command should display the title, release year, imbd rating, rt rating, country, language, actors, and plot
function getMovie(movie) {
    //If there is no movie listed for this command default to'Mr. Nobody'
    if (movie === "" || movie === undefined || movie === null) {
        var defaultMovie = 'Mr. Nobody';

        axios.get("http://www.omdbapi.com/?t=" + defaultMovie + "&plot=full&apikey=3d42b8e8").then(function (response) {
            console.log('---------------------------------------------\nMOVIE TITLE: "' + response.data.Title +
                '"\nRelease Year: ' + response.data.Year +
                '\nIMDB Rating: ' + response.data.imdbRating +
                '\nRotten Tomatoes Rating: ' + response.data.Ratings[1].Value +
                '\nCountry: "' + response.data.country +
                '"\nLanguage: "' + response.data.Language +
                '"\nActors: "' + response.data.Actors +
                '"\n\nPlot: "' + response.data.Plot +
                '"\n---------------------------------------------\nIf you haven\'t watched Mr. Nobody, you should! It\'s on Netflix!\n"http://www.imdb.com/title/tt0485947/"');
        })
    }
    // Run normally if a movie title is entered
    else {
        axios.get("http://www.omdbapi.com/?t=" + movie + "&plot=full&apikey=3d42b8e8").then(function (response) {
            console.log('---------------------------------------------\nMOVIE TITLE: "' + response.data.Title +
                '"\nRelease Year: ' + response.data.Year +
                '\nIMDB Rating: ' + response.data.imdbRating +
                '\nRotten Tomatoes Rating: ' + response.data.Ratings[1].Value +
                '\nCountry: "' + response.data.country +
                '"\nLanguage: "' + response.data.Language +
                '"\nActors: "' + response.data.Actors +
                '"\n\nPlot: "' + response.data.Plot + '"\n');
        });
    }
}
//do-what-it-says should run a command in a random.txt file
function getLog(command, value) {
    fs.readFile("random.txt", "utf8", function (error, data) {
        if (error) {
            return console.log(error);
        }
        var dataArr = data.split(",");
        command = dataArr[0];
        value = dataArr[1];
        value = value.split("");
        value.splice(value.indexOf('"'), 1);
        value.splice(value.lastIndexOf('"'), 1);
        value = value.join('');
        getUserCommand(command, value);
    });
}
//Run the function
getUserCommand(process.argv[2], process.argv.splice(3).join(" "));