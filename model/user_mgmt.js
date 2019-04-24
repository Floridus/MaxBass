"use strict"

var config = require('../config.js')

var UserManager = function(theView, parsedurlinfo, res, dbclient){
	this.userView = theView
	this.parsedurlinfo = parsedurlinfo
	this.res = res
	this.dbclient = dbclient
	this.debug = config.debug
}

UserManager.prototype.checkLogin = function(email, password){
	if (this.debug) 
		console.log("[DEBUG] checkLogin with UserManager ...")
	var view = this.userView
	var client = this.dbclient
	var dataList = [];
	// Auslesen von users - Set
	client.smembers('users', function(err, replies) {
		console.log("[DEBUG] get all users data")
		replies.forEach(function (reply) {
			dataList.push(reply);
		});
		console.log("[DEBUG] login view")
		view.login(dataList, email, password)
	});
}

UserManager.prototype.logoutUser = function(email, password){
	if (this.debug) 
		console.log("[DEBUG] logoutUser with UserManager ...")
	
	this.userView.logout()
}

UserManager.prototype.registerUser = function(name, email, pwOne, pwTwo, level, birthday, music){
	if (this.debug) 
		console.log("[DEBUG] registerUser with UserManager ...")
	
	var view = this.userView
	
	if (pwOne == pwTwo) {
		var client = this.dbclient
		var dataList = [];
		// Auslesen von users - Set
		client.smembers('users', function(err, replies) {
			if (this.debug) 
				console.log("[DEBUG] get all users data")
			replies.forEach(function (reply) {
				dataList.push(reply);
			});
			if (this.debug) 
				console.log("[DEBUG] register view")
			view.register(dataList, name, email, pwOne, level, birthday, music)
		});
	} else {
		view.registerFail("password");
	}
}

module.exports = UserManager