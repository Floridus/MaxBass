//Standard-Layout -> /view/layout.html

var http = require('http');
var config = require('../config.js');
var redis = require("redis");

// helper functionality
var up = require('../helper/urlparser');

// some dynamic and static controllers
var stc = require('./static_contr.js');
var vic = require('./video_contr.js');
var pac = require('./page_contr.js');
var usc = require('./user_contr.js');
var coc = require('./cookie_contr.js');

var dbclient = redis.createClient(config.dbport, config.server);
	dbclient.on('connect', function() {
		console.log('Connected to Redis Database');
	});
	// Sets
	dbclient.sadd("users", "user:1");
	dbclient.sadd("videos", "video:1");
	dbclient.sadd("videos", "video:2");
	// Hashs
	dbclient.hmset("user:1", "id", "1", "name", "Florian Weiss", "email", "test%40test.at", "password", "test", "level", "5", "birthday", "1994-04-12", "music", "Rock", "token", "TestTokenX", "isActivated", "1", "isAdmin", "1");
	dbclient.hmset("video:1", "id", "1", "title", "Wildlife", "owner", "Markus Kulmer", "length", "00:30", "category", "Rock", "source", "/public/videos/Wildlife.wmv", "level", "Difficult");
	dbclient.hmset("video:2", "id", "2", "title", "Gostan - Klanga (De Hofnar Remix)", "owner", "Florian Weiss", "length", "04:24", "category", "Pop", "source", "/public/videos/Gostan_-_Klanga_(De_Hofnar_Remix).mp4", "level", "Easy");

// Gets the rhight controller
function doTheRouting(urlparser, res, cookieController){
	console.log("[INFO] Routing for resource: '" + urlparser.resource + "':")
	var currentController = null;
	
	if (urlparser.resource == "video"){
		currentController= new vic.VideoController(urlparser, res, cookieController, dbclient);
	} else if(urlparser.resource == "page"){
		currentController= new pac.PagesController(urlparser, res, cookieController);
	} else if(urlparser.resource == "user"){
		currentController= new usc.UserController(urlparser, res, cookieController, dbclient);
	} else {
		// we assume static content by default
		currentController= new stc.StaticController(urlparser, res);
	}
	
	currentController.handle()
}

// Startet Server
startup = function(){
	var serv = http.createServer(function(req, res) {
		// CookieController wird erstellt
		cookieController = new coc.CookieController(req, res);
		
		console.log("----------------------------------------------------------------")
		
		var urlparser = null
		// for e.g. curl -X POST "http://localhost:8000/testing/8000/video/new.json" --data "title=Fire&artist=Hendrix"
		if (req.method == "POST" || req.method == "PUT"){ // get body data
			var body = '';
			req.on("data",function(data){body+=data} );
			req.on("end",function(){
				console.log("[POST-DATA] ", body);
				urlparser = new up.UrlParser(req, body);
				doTheRouting(urlparser, res, cookieController);
			} );
			req.on("error",function(){
				res.end("[ERROR] while getting POST/PUT-data")
			});
		} else { // GET, DELETE (no body data)
			urlparser = new up.UrlParser(req, "");
			doTheRouting(urlparser, res, cookieController);
		}
	});
	
	config.port = (process.argv.length > 2) ? process.argv[2] : config.port
	serv.listen(config.port);
}

module.exports.startup = startup