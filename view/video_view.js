"use strict"
var fs = require('fs')
var config = require('../config.js')
var lang_en = require('../data/en.js')
var lang_de = require('../data/de.js')

var VideoView = function(parsedurlinfo, res, cookieController, dbclient){
	this.parsedurlinfo = parsedurlinfo
	this.res = res
	this.dbclient = dbclient
	this.cookieController = cookieController
	this.debug = config.debug
	this.lang = config.language
	
	if (this.parsedurlinfo.language != config.language) {
		this.lang = this.parsedurlinfo.language;
	}

	this.layout = "view/layout.html"
	this.video_template = "view/video/video_template.html"
	this.form_template = "view/video/form_template.html"
	this.videos_template	= "view/video/videos_template.html"
	this.mgt_template = "view/video/mgt_template.html"
	
	if (this.debug) 
		console.log("[DEBUG] VideoView initialise...")
}

// Overall Video rendering
VideoView.prototype.render = function(videodata){
	var debug = config.debug
	var format = this.parsedurlinfo.format
	if (this.debug) 
		console.log("[DEBUG] VideoView render in format: ",format)
	
	if (format == "html"){	
		// now we render one video, many video or other
		this.getOverallLayout(videodata)
	} else {
		console.log("Error: The specified format '" + format + "' is unknown!")
	}
}

// Creates formatted HTML for Single Vids / List of Vids
// -> List of Vids -> HR before each Vid (= Separator)
// Edits Form -> "Edit Video" if existing, "Create Video" if not
VideoView.prototype.formatHtml = function(data, htmlTemplate){
	var result = htmlTemplate
	var client = this.dbclient

	if (this.parsedurlinfo.id == "all" || this.parsedurlinfo.id == "deletevideo") { // a list of videos
		var htmlStructure = '';
		var cookieController = this.cookieController
		
		data.forEach(function (object) {
			// develop
			object.description = "this is a test description...";
			
			htmlStructure += '<hr class="style-gradient"><div class="media">';
			
			htmlStructure += '<div class="media-left">';
			htmlStructure += '<a href="' + object.id + '.html"><img class="media-object" src="http://placehold.it/150x100" alt="placeholder"></a>';
			htmlStructure += '</div>';
			
			htmlStructure += '<div class="media-body">';
			htmlStructure += '<h4 class="media-heading"><a href="' + object.id + '.html">' + object.title + '</a></h4>';
			htmlStructure += '<b style="color: blue">' + object.length + '</b> - ' + object.owner;
			htmlStructure += '<br><b style="color: green">' + object.category + '</b> - ' + object.level + '<br>' + object.description;
			htmlStructure += '</div>';
			
			htmlStructure += '</div>';
		});
		
		var cookiesDict = cookieController.getCookies();
		
		if ("loginID" in cookiesDict) { // if user is logged in
			result = result.replace(/{OFFLINE}/g, "hide");
		}
		
		result = result.replace(/{VIDEOS}/g, htmlStructure);
		result = result.replace(/{FOUNDED}/g, data.length);
	} else if (this.parsedurlinfo.id == "search" || this.parsedurlinfo.id == "videomgt") {
		// do nothing
	} else if (this.parsedurlinfo.id == "form") {
		if (this.parsedurlinfo.body.indexOf("update") != -1) {
			var params = this.parsedurlinfo.body.split('&')
			var videoid = params[0].split('=')
			result = result.replace(/{NEXTACTION}/g, "video/updatevideo.html" )
						   .replace(/{VIDEOID}/g, videoid[1])
						   .replace(/{SUBMITTEXT}/g, "Edit video")
		} else {
			result = result.replace(/{NEXTACTION}/g, "video/newvideo.html" )
						   .replace(/{SUBMITTEXT}/g, "Add video")
		}
	} else { // a single video:
		if (data && data.title)
			result=result.replace(/{TITLE}/g, data.title)
						 .replace(/{OWNER}/g, data.owner)
						 .replace(/{VIDEOID}/g, data.id)
						 .replace(/{SOURCE}/g, data.source)
						 .replace(/{LENGTH}/g, data.length)
						 .replace(/{CATEGORY}/g, data.category)
						 .replace(/{LEVEL}/g, data.level)
						 .replace(/{DESCRIPTION}/g, data.description)
	}

	// send html data back to client
	this.res.writeHead(200, {'Content-Type': 'text/html'} );
	this.res.end(result);
}

// read File and replace contents
VideoView.prototype.getDetailTemplate = function(videodata, layoutHtml){
	if (this.parsedurlinfo.id == "videomgt") { // TODO allow search for videos
		var filenameDetailTemplate = this.mgt_template
	} else if (this.parsedurlinfo.id == "all" || this.parsedurlinfo.id == "deletevideo") {
		var filenameDetailTemplate = this.videos_template
	} else if (this.parsedurlinfo.id == "form") {
		var filenameDetailTemplate = this.form_template
	} else {
		var filenameDetailTemplate = this.video_template
	}
	// put it into the layout
	var videoView = this
	var cookieController = this.cookieController
	fs.readFile(filenameDetailTemplate,function(err, layoutdata){
		if (err === null ){
			var templateDetail= layoutdata.toString('UTF-8')
			var htmlTemplate = layoutHtml.replace(/{CONTENTS}/g, templateDetail);
			htmlTemplate = htmlTemplate.replace(/{SITETITLE}/g, config.title);
			htmlTemplate = htmlTemplate.replace(/{AUTHOR}/g, config.author);
			htmlTemplate = htmlTemplate.replace(/{VERSION}/g, config.version);
			
			htmlTemplate = videoView.setLanguageForTemplate(htmlTemplate);
			
			var cookiesDict = cookieController.getCookies();
			
			if ("loginID" in cookiesDict) { // if user is logged in
				htmlTemplate = htmlTemplate.replace(/{OFFLINE}/g, "hide");
			} else { // if user is not logged in
				htmlTemplate = htmlTemplate.replace(/{INLOGGED}/g, "hide");
			}
			
			videoView.formatHtml(videodata, htmlTemplate);
		}else
			console.log("[ERROR] reading detail-template file '" + filenameDetailTemplate + "' for videos: "+err);
	});
}

// Basis-Layout
VideoView.prototype.getOverallLayout = function(videodata){
	var debug = config.debug
	var filenameLayout = this.layout
	if (debug) 
		console.log("[DEBUG] VideoView render in format HTML with template '"+filenameLayout+"'")
	var videoView = this
	fs.readFile(filenameLayout,function(err, filedata){ // async read data (from fs/db)
		if (err === null) {
			var layoutHtml= filedata.toString('UTF-8')
			videoView.getDetailTemplate(videodata, layoutHtml)
		} else
			console.log("[ERROR] reading global layout-template file '"+filenameLayout+"'. Error "+err);
	})
}

VideoView.prototype.setLanguageForTemplate = function(htmlTemplate) {
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

module.exports = VideoView