"use strict"
var fs = require('fs')
var config = require('../config.js')
var lang_en = require('../data/en.js')
var lang_de = require('../data/de.js')
	
var PageView = function(parsedurlinfo, res, cookieController){
	this.parsedurlinfo = parsedurlinfo
	this.res = res
	this.cookieController = cookieController
	this.debug = config.debug
	this.lang = config.language
	
	if (this.parsedurlinfo.language != config.language) {
		this.lang = this.parsedurlinfo.language;
	}
	
	this.layout = "view/layout.html"
	
	if (this.debug) 
		console.log("[DEBUG] PageView initialise...")
}

// Overall Page rendering
PageView.prototype.render = function(){
	var format = this.parsedurlinfo.format
	if (this.debug) 
		console.log("[DEBUG] PageView render in format: " + format)
	
	if (format == "html") {
		this.getOverallLayout()
	} else {
		console.log("Error: The specified format '" + format + "' is unknown!")
	}
}

// read File, replace contents and write it out as "text/html"
PageView.prototype.getDetailTemplate = function(layoutHtml){
	// Gets ID from urlparser.js
	if (this.parsedurlinfo.id == "about") {
		var filenameDetailTemplate = "view/page/about.html";
	} else if (this.parsedurlinfo.id == "welcome") {
		var filenameDetailTemplate = "view/page/welcome.html";
	} else if (this.parsedurlinfo.id == "tour") {
		var filenameDetailTemplate = "view/page/tour.html";
	} else if (this.parsedurlinfo.id == "challenge") {
		var filenameDetailTemplate = "view/page/challenge.html";
	} else if (this.parsedurlinfo.id == "help") {
		var filenameDetailTemplate = "view/page/help.html";
	} else if (this.parsedurlinfo.id == "impressum") {
		var filenameDetailTemplate = "view/page/impressum.html";
	} else {
		var filenameDetailTemplate = "view/page/error.html";
	}
	// put it into the layout
	var pageView = this;
	var cookieController = this.cookieController;
	var res = this.res;
	fs.readFile(filenameDetailTemplate,function(err, layoutdata){
		if (err === null ){
			var templateDetail = layoutdata.toString('UTF-8')
			var htmlTemplate = layoutHtml.replace(/{CONTENTS}/g, templateDetail)
			htmlTemplate = htmlTemplate.replace(/{SITETITLE}/g, config.title)
			htmlTemplate = htmlTemplate.replace(/{AUTHOR}/g, config.author)
			htmlTemplate = htmlTemplate.replace(/{VERSION}/g, config.version)
			
			htmlTemplate = pageView.setLanguageForTemplate(htmlTemplate);
			
			var cookiesDict = cookieController.getCookies();
			
			if ("loginID" in cookiesDict) { // if user is logged in -> hide {OFFLINE} elem.
				htmlTemplate = htmlTemplate.replace(/{OFFLINE}/g, "hide");
			} else { // if user is not logged in -> hide {INLOGGED} elem.
				htmlTemplate = htmlTemplate.replace(/{INLOGGED}/g, "hide");
			}
			
			res.writeHead(200, {'Content-Type': 'text/html'} );
			res.end(htmlTemplate);
		} else
			console.log("[ERROR] reading detail-template file '"+filenameDetailTemplate+"' for songs: "+err);
	});
}

// Loads content of "this.layout" (Standard = layout.html) into var "layoutHtml"
PageView.prototype.getOverallLayout = function() {
	var debug = this.debug;
	var filenameLayout = this.layout
	if (debug) 
		console.log("[DEBUG] PageView render in format HTML with template '"+filenameLayout+"'")
	var pageView = this
	fs.readFile(filenameLayout,function(err, filedata){ // async read data (from fs/db)
		if (err === null ){
			var layoutHtml = filedata.toString('UTF-8')
			pageView.getDetailTemplate(layoutHtml)
		}else
			console.log("[ERROR] reading global layout-template file '"+filenameLayout+"'. Error "+err);
	})
}

PageView.prototype.setLanguageForTemplate = function(htmlTemplate) {
	htmlTemplate = htmlTemplate.replace(/{LANG}/g, "/" + this.lang)
	
	if (this.lang == "de") {
		htmlTemplate = htmlTemplate.replace(/{LESSONS}/g, lang_de.lessons)
		htmlTemplate = htmlTemplate.replace(/{FREE}/g, lang_de.free)
		htmlTemplate = htmlTemplate.replace(/{CHALLENGE}/g, lang_de.challenge)
		htmlTemplate = htmlTemplate.replace(/{TOUR}/g, lang_de.tour)
		htmlTemplate = htmlTemplate.replace(/{ABOUT}/g, lang_de.about)
		htmlTemplate = htmlTemplate.replace(/{HELP}/g, lang_de.help)
		htmlTemplate = htmlTemplate.replace(/{MGT}/g, lang_de.mgt)
		htmlTemplate = htmlTemplate.replace(/{LOGIN}/g, lang_de.login)
		htmlTemplate = htmlTemplate.replace(/{REGISTER}/g, lang_de.register)
		htmlTemplate = htmlTemplate.replace(/{PROFIL}/g, lang_de.profil)
		htmlTemplate = htmlTemplate.replace(/{LOGOUT}/g, lang_de.logout)
		htmlTemplate = htmlTemplate.replace(/{IMPRINT}/g, lang_de.imprint)
		htmlTemplate = htmlTemplate.replace(/{EMAIL}/g, lang_de.email)
		htmlTemplate = htmlTemplate.replace(/{PASSWORD}/g, lang_de.password)
		htmlTemplate = htmlTemplate.replace(/{FORGET}/g, lang_de.forget)
		htmlTemplate = htmlTemplate.replace(/{FIRSTNAME}/g, lang_de.firstname)
		htmlTemplate = htmlTemplate.replace(/{LASTNAME}/g, lang_de.lastname)
		htmlTemplate = htmlTemplate.replace(/{RETYPE}/g, lang_de.retypePW)
		htmlTemplate = htmlTemplate.replace(/{BIRTHDAY}/g, lang_de.birthday)
		htmlTemplate = htmlTemplate.replace(/{LEVEL}/g, lang_de.level)
		htmlTemplate = htmlTemplate.replace(/{STYLE}/g, lang_de.style)
	} else if (this.lang == "en") {
		htmlTemplate = htmlTemplate.replace(/{LESSONS}/g, lang_en.lessons)
		htmlTemplate = htmlTemplate.replace(/{FREE}/g, lang_en.free)
		htmlTemplate = htmlTemplate.replace(/{CHALLENGE}/g, lang_en.challenge)
		htmlTemplate = htmlTemplate.replace(/{TOUR}/g, lang_en.tour)
		htmlTemplate = htmlTemplate.replace(/{ABOUT}/g, lang_en.about)
		htmlTemplate = htmlTemplate.replace(/{HELP}/g, lang_en.help)
		htmlTemplate = htmlTemplate.replace(/{MGT}/g, lang_en.mgt)
		htmlTemplate = htmlTemplate.replace(/{LOGIN}/g, lang_en.login)
		htmlTemplate = htmlTemplate.replace(/{REGISTER}/g, lang_en.register)
		htmlTemplate = htmlTemplate.replace(/{PROFIL}/g, lang_en.profil)
		htmlTemplate = htmlTemplate.replace(/{LOGOUT}/g, lang_en.logout)
		htmlTemplate = htmlTemplate.replace(/{IMPRINT}/g, lang_en.imprint)
		htmlTemplate = htmlTemplate.replace(/{EMAIL}/g, lang_en.email)
		htmlTemplate = htmlTemplate.replace(/{PASSWORD}/g, lang_en.password)
		htmlTemplate = htmlTemplate.replace(/{FORGET}/g, lang_en.forget)
		htmlTemplate = htmlTemplate.replace(/{FIRSTNAME}/g, lang_en.firstname)
		htmlTemplate = htmlTemplate.replace(/{LASTNAME}/g, lang_en.lastname)
		htmlTemplate = htmlTemplate.replace(/{RETYPE}/g, lang_en.retypePW)
		htmlTemplate = htmlTemplate.replace(/{BIRTHDAY}/g, lang_en.birthday)
		htmlTemplate = htmlTemplate.replace(/{LEVEL}/g, lang_en.level)
		htmlTemplate = htmlTemplate.replace(/{STYLE}/g, lang_en.style)
	}
	
	return htmlTemplate;
}

module.exports = PageView