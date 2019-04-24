"use strict"
var nodemailer = require('nodemailer');
var async = require('async');
var config = require('../config.js');

var UserView = function(parsedurlinfo, res, cookieController, dbclient){
	this.parsedurlinfo = parsedurlinfo
	this.res = res
	this.cookieController = cookieController
	this.dbclient = dbclient
	this.debug = config.debug
	
	if (this.debug) 
		console.log("[DEBUG] UserView initialise...")
}

// LOGIN
// -> checks if email and password match DB entries
//   -> if yes, sets 'login' to 'true'
UserView.prototype.login = function(userList, email, pw) {
	var format = this.parsedurlinfo.format
	var client = this.dbclient
	var debug = this.debug
	
	if (debug) 
		console.log("[DEBUG] UserView --> Login")
	
	var calls = [];
	
	if (format == "json") { // content type for JSON
		var success = [];
		var userView = this
	
		// Loops through each User
		userList.forEach(function (reply) {
			// we are waiting for finished list
			calls.push(function(callback) {
				client.hgetall(reply, function(err, object) {
					if (debug) 
						console.log("[DEBUG] forEach");
					if (err)
						return callback(err);
					if (debug) 
						console.log("[DEBUG] Look for email address " + email);
					if (debug) 
						console.log("[DEBUG] compare email " + object.email + " with " + email);
					if (object.email == email) { // look for the same email
						if (debug) 
							console.log("[DEBUG] Email found -> check password");
						if (debug) 
							console.log("[DEBUG] compare password " + object.password + " with " + pw);
						if (object.password == pw) { // check password
							if (debug) 
								console.log("[DEBUG] Password is correct -> set cookie");
							userView.saveCookie("loginID", "user:" + object.id); // set user:id
							success.push(true);
						} else {
							success.push(false);
							if (debug) 
								console.log("[DEBUG] Password is INcorrect");
						}
					} else {
						success.push(false);
						if (debug) 
							console.log("[DEBUG] Email NOT found");
					}
					callback(null, success);
				});
			});
		});
		
		/*
		 * this code will run after all calls finished the job or
		 * when any of the calls passes an error
		 * the result is an array equals [ false ]
		 */
		async.parallel(calls, function(err, result) {
			if (err)
				return console.log(err);
			if (debug) 
				console.log("[DEBUG] write header")
			var ret = false;
			var i = 0;
			// da es leider einen Fehler gibt bei der übergabe des result arrays, haben wir so eine hardcoded Lösung
			// Es übergibt mehrere Arrays im Array
			// Lösung:
			// --> Von jedem Array benötigen wir nur einen Wert und zwar den Wert bei dem Array wo wir gerade sind --> also
			// beim 1. Array den 1. Wert, beim 2. Array den 2. Wert und beim 3. Array den 3. Wert
			result.forEach(function (reply) {
				if (reply[i] == true)
					ret = true;
				i ++;
			});
			userView.writeHeader(JSON.stringify({ 'login': ret }));
		});
	} else {
		console.log("[ERROR] The specified format '" + format + "' is unknown!")
	}
}

// LOGOUT
// -> sets 'logout' to 'true'
UserView.prototype.logout = function() {
	if (this.debug) 
		console.log("[DEBUG] UserView --> Logout")
	this.cookieController.removeCookie("loginID");
	this.writeHeader(JSON.stringify({ 'logout': true }));
}

// REGISTRATION
// -> writes a new User to redis DB (if arguments are valid)
// -> ruft sendEmail() auf, um Token zu senden
// -> Token wird mit generateToken() generiert
UserView.prototype.register = function(userList, name, email, pw, level, birthday, music) {
	var debug = this.debug
	var format = this.parsedurlinfo.format
	var client = this.dbclient
	var calls = [];
	var maxID = userList.length + 1; // get unique max id
	
	if (debug) 
		console.log("[DEBUG] UserView --> Register")
	
	if (format == "json") { // content type for JSON
		var success = [];
		var userView = this
	
		userList.forEach(function (reply) {
			// we are waiting for finished list
			calls.push(function(callback) {
				client.hgetall(reply, function(err, object) {
					if (debug) 
						console.log("[DEBUG] forEach");
					if (err)
						return callback(err);
					if (debug) 
						console.log("[DEBUG] Look for email address " + email);
					if (debug) 
						console.log("[DEBUG] compare email " + object.email + " with " + email);
					if (object.email == email) { // look for the same email
						success.push(false);
					} else {
						success.push(true);
					}
					callback(null, success);
				});
			});
		});
		
		/*
		 * this code will run after all calls finished the job or
		 * when any of the calls passes an error
		 * the result is an array equals [ false ]
		 */
		async.parallel(calls, function(err, result) {
			if (err)
				return console.log(err);
			console.log("[DEBUG] write header")
			
			var ret = true;
			var i = 0;
			// Gleich wie beim Login
			result.forEach(function (reply) {
				if (reply[i] == false)
					ret = false;
				i ++;
			});
			
			// if ret is true then register the new account
			if (ret) {
				success = true;
				
				var userID = "user:" + maxID;
				var token = userView.generateToken(20);
				
				userView.sendEmail(name, email, token);
				
				client.sadd("users", userID);
				client.hmset(userID, "id", maxID.toString(), "name", name, "email", email, "password", pw, "level", level, "birthday", birthday, "music", music, "token", token, "isActivated", "0", "isAdmin", "0");
				console.log("Registered User");
				
				userView.writeHeader(JSON.stringify({ 'register': true, 'message': "Successfully registered." }));
			// if email address is used by another user
			} else {
				userView.registerFail("emailInUse");
			}
		});
	} else {
		console.log("[ERROR] The specified format '" + format + "' is unknown!")
	}
}

// sendet Message mit generiertem Token (für Double Opt-In)
UserView.prototype.sendEmail = function(name, email, token) {
	console.log("We configure FH Joanneum (smtp) mail:");
	var transporter = nodemailer.createTransport(
		{
			host: config.mailhost,
			port: config.mailport
		}
	);
	
	// no risk
	email = email.replace('%40', '@');
	email = email.replace('%2D', '-');
	email = email.replace('%5F', '_');
	
	var message = 'Welcome ' + name + ',\n\nThank you for your registration at MaxBass.\nTo activate your account, please go to the following page: \nhttp://' + config.server + ':' + config.port + '/user/activation.json?token=' + token + '\n\nBest regards,\nMaxBass Team';
	
	console.log("Sending Email ...");
	transporter.sendMail({
		from: 'office@maxbass.at',
		to: email,
		subject: 'Registration at MaxBass',
		text: message,
	}, function(err, info) {
		if (err)
			console.log(err)
		else
			console.log("Msg ID: " + info.messageId)
	});
}

// generiert Token (Länge = 20 Zeichen)
UserView.prototype.generateToken = function(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i = 0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

// Registriert falsche Eingaben
// -> PW und Retype stimmen nicht überein
// -> Email wird bereits verwendet
UserView.prototype.registerFail = function(reason) {
	var message = "error message";
	if (reason == "password") {
		message = "Passwords are not the same."
	} else if (reason == "emailInUse") {
		message = "Email address is already in use.";
	}
	this.writeHeader(JSON.stringify({ 'register': false, 'message': message }));
}

UserView.prototype.saveCookie = function(key, value) {
	this.cookieController.addCookie(key, value);
}

UserView.prototype.writeHeader = function(result) {
	this.res.writeHead(200, { 'Content-Type': 'application/json' } );
	this.res.end(result); // return formatted data to the client
}

module.exports = UserView