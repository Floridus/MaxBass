"use strict"

var videoModel = require("../model/video_model.js");
var config = require('../config.js')

var VideoManager = function(theView, parsedurlinfo, res, dbclient){
	this.videoView = theView
	this.parsedurlinfo = parsedurlinfo
	this.res = res
	this.dbclient = dbclient
	this.debug = config.debug
}

// find all the videos (optional: fulfilling a given filter-criterium)
VideoManager.prototype.findAll = function(filter){
	if (this.debug) 
		console.log("[DEBUG] VideoData find all videos...")
	var view = this.videoView
	var client = this.dbclient
	var dataList = [];
	var search = false;
	if (filter.length > 1)
		search = true;
	// Auslesen von videos - Set
	client.smembers('videos', function(err, replies) {
		replies.forEach(function (reply) {
			// Auslesen von jedem einzelnen video:x - Hash (format ist video:ID)
			client.hgetall(reply, function(err, object) {
				if (search) { // use the filter
					var videoTitle = object.title;
					if (object.category == filter[0] || videoTitle.indexOf(filter[1]) != -1) {
						dataList.push(object);
					}
				} else {
					dataList.push(object);
				}
			});
		});
		view.render(dataList)
	});
}

VideoManager.prototype.deleteById = function(id){
	if (this.debug) console.log("[DEBUG] VideoData delete songs by id '" + id + "'...")
	var view = this.videoView
	
	var client = this.dbclient
	
	// remove from set
	client.srem("videos", "video:" + id);
	console.log("[INFO] Video by ID " + id + " was deleted.");
	// weiterleitung
	this.findAll();
}

// find a video by it's id
VideoManager.prototype.findById = function(id){
	if (this.debug) console.log("[DEBUG] VideoData find video by id '"+id+"'...")
	var view = this.videoView
	var client = this.dbclient
	// Auslesen vom einzelnen video:x - Hash (format ist video:ID)
	client.hgetall("video:"+id, function(err, object) {
		if (err) {
			console.log("[ERROR] Video was not found by ID " + id + ".", err);
		} else {
			var objectVideo = new videoModel.Video(object.id, object.title, object.owner, object.length, object.category, object.source, object.level, object.description);
			view.render(objectVideo);
		}
	});
}

VideoManager.prototype.createVideo = function(){
	if (this.debug) console.log("[DEBUG] create a new Video")
	var view = this.videoView
	var client = this.dbclient
	
	var bodyData = this.parsedurlinfo.body
	var params = bodyData.split('&')
	
	var params = bodyData.split('&')
	var title = params[1].split('=')
	var length = params[2].split('=')
	var style = params[3].split('=')
	var level = params[4].split('=')
	var description = params[5].split('=')
	
	// Auslesen von videos - Set
	client.smembers('videos', function(err, replies) {
		// Wieviel Einträge gibt es und + 1 rechnen für die neue ID
		var freeID = replies.length + 1;
		// Neues temporäres JSON Object erstellen
		var video = {
			"id":freeID,
			"title":title[1],
			"owner":"Florian Weiss",
			"length":length[1],
			"category":style[1],
			"source":"",
			"level":level[1],
			"description":description[1]
		}
		client.sadd("videos", "video:" + freeID);
		dbclient.hmset("video:"+video.id, "id", video.id, "title", video.title, "owner", video.owner, "length", video.length, "category", video.category, "source", video.source, "level", video.level, "description", video.description);
		var objectVideo = new videoModel.Video(video.id, video.title, video.owner, video.length, video.category, video.source, video.level, video.description);
		view.render(objectVideo);
		console.log("[INFO] Video was saved.");
	});
}

/*
 * update (=replace) a video with a given id
 * curl -X PUT "http://localhost:8888/testing/video/2.json?title=Another%20bites&artist=queen"
 */
VideoManager.prototype.persistById = function(id){
	if (this.debug) console.log("[DEBUG] VideoData store/persist video by id '"+ id +"'...")
	var view = this.videoView
	var client = this.dbclient
	var bodyData = this.parsedurlinfo.body
	
	/* ------ [POST-DATA] ------
	 * videoid=[int]
	 * title=[string]
	 * length=[string (XX:XX)]
	 * music-style=[string]
	 * level=[int (1-5)]
	 * description=[string]
	 * ------ [POST-DATA] ------
	 */
	
	var params = bodyData.split('&')
	var title = params[1].split('=')
	var length = params[2].split('=')
	var style = params[3].split('=')
	var level = params[4].split('=')
	var description = params[5].split('=')
	
	var video = {
		"id":id,
		"title":title[1],
		"owner":"Florian Weiss",
		"length":length[1],
		"category":style[1],
		"source":"",
		"level":level[1],
		"description":description[1]
	}
	
	// don't overwrite all
	dbclient.hmset("video:"+id, "title", video.title, "category", video.category, "level", video.level, "description", video.description);
	var objectVideo = new videoModel.Video(video.id, video.title, video.owner, video.length, video.category, video.source, video.level, video.description);
	view.render(objectVideo);
	console.log("[INFO] Video was saved.");
}

module.exports = VideoManager