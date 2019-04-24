var UserManager = require("../model/user_mgmt")
var UserView 	= require("../view/user_view")

var UserController=function(parsedurlinfo, res, cookieController, dbclient){
	this.parsedurlinfo = parsedurlinfo
	this.res = res
	this.dbclient = dbclient
	this.userView = new UserView(parsedurlinfo, res, cookieController, dbclient)
	this.userManager = new UserManager(this.userView, parsedurlinfo, res, dbclient)
}

UserController.prototype.handle=function () {
	console.log("[INFO] Handling User Content for: id='"+this.parsedurlinfo.id+"'");
	console.log("[INFO] Handling User Content for: format='"+this.parsedurlinfo.format+"'");
	
	var client = this.dbclient
	var view = this.userView

	if (this.parsedurlinfo.id == "login"){
		console.log("[INFO] login User");
		
		// Login Data:
		// POST-DATA --> email=XXX&password=XXX@XXX.XX
		var params = this.parsedurlinfo.body.split("&") // [2] => [0] - email | [1] - password
		var emailParts = params[0].split("=")
		var pwParts = params[1].split("=")
		
		var email = emailParts[1]
		var pw = pwParts[1]
		
		this.userManager.checkLogin(email, pw)
	} else if (this.parsedurlinfo.id == "logout"){
		console.log("[INFO] logout User");
		
		this.userManager.logoutUser()
	} else if (this.parsedurlinfo.id == "register"){
		console.log("[INFO] register User");
		
		// Registration Data:

		/* ------ [POST-DATA] ------
		 * firstname=[string]
		 * password=[string]
		 * email=[string]
		 * level=[int (1-5)]
		 * lastname=[string]
		 * passwordTwo=[string]
		 * birthday_birth%5Bmonth%5D=[int (1-12)]
		 * birthday_birth%5Bday%5D=[int (1-31)]
		 * birthday_birth%5Byear%5D=[int (1936-2016)]
		 * birthday_birthDay=[string (YYYY-MM-DD)]
		 * music-style=[string]
		 * ------ [POST-DATA] ------
		 */
		var params = this.parsedurlinfo.body.split("&")
		var firstNameParts = params[0].split("=")
		var pwParts = params[1].split("=")
		var emailParts = params[2].split("=")
		var levelParts = params[3].split("=")
		var lastNameParts = params[4].split("=")
		var pwTwoParts = params[5].split("=")
		var birthdayParts = params[9].split("=")
		var musicParts = params[10].split("=")
		
		var name = firstNameParts[1] + " " + lastNameParts[1];
		
		this.userManager.registerUser(name, emailParts[1], pwParts[1], pwTwoParts[1], levelParts[1], birthdayParts[1], musicParts[1]);
	} else {
		console.log("[INFO] return nothing, because id = '"+this.parsedurlinfo.id+"'");
	}
}

module.exports.UserController = UserController