var VideoManager = require("../model/video_mgmt")
var VideoView 	= require("../view/video_view")

var VideoController=function(parsedurlinfo, res, cookieController, dbclient){
	this.parsedurlinfo = parsedurlinfo
	this.res = res
	this.videoView = new VideoView(parsedurlinfo, res, cookieController, dbclient)
	this.dbclient = dbclient
	this.videoManager = new VideoManager(this.videoView, parsedurlinfo, res, dbclient)
}

VideoController.prototype.handle=function () {
	console.log("[INFO] Handling Video Content for: id='"+this.parsedurlinfo.id+"'");
	console.log("[INFO] Handling Video Content for: format='"+this.parsedurlinfo.format+"'");

	if (this.parsedurlinfo.id == "all"){
		console.log("[INFO] return all videos, because id = '"+this.parsedurlinfo.id+"'");
		var filter = []
		/* filter is not working
		var params = this.parsedurlinfo.params;
		console.log("[DEBUG] Params -> " + Object.keys(params));
		console.log("[DEBUG] Params length -> " + Object.keys(params).length);
		if (Object.keys(params).length > 1) {
			for (var key in Object.keys(params)) {
				console.log("key: " + key);
				console.log("value: " + params[key]);
				filter.push(params[key]);
			}
			console.log("filter: " + filter);
		}*/
		this.videoManager.findAll(filter)
	} else if (this.parsedurlinfo.id == "newvideo") {
		console.log("[INFO] create new video");
		/* ------ [POST-DATA] ------
		 * videoid=[int]
		 * title=[string]
		 * length=[string (XX:XX)]
		 * music-style=[string]
		 * level=[int (1-5)]
		 * description=[string]
		 * ------ [POST-DATA] ------
		 */
		this.videoManager.createVideo()
	} else if (this.parsedurlinfo.id == "deletevideo") {
		console.log("[INFO] delete video by id = '"+this.parsedurlinfo.id+"'");
		// POST-DATA --> id=3&delete=Entfernen
		var params = this.parsedurlinfo.body.split("&")
		var parts = params[0].split("=")
		var no = parseInt(parts[1]) // only video id is used
		this.videoManager.deleteById(no)
	} else if (this.parsedurlinfo.id == "updatevideo") {
		console.log("[INFO] update video by id = '"+this.parsedurlinfo.id+"'");
		/* ------ [POST-DATA] ------
		 * videoid=[int]
		 * title=[string]
		 * length=[string (XX:XX)]
		 * music-style=[string]
		 * level=[int (1-5)]
		 * description=[string]
		 * ------ [POST-DATA] ------
		 */
		var params = this.parsedurlinfo.body.split("&")
		var parts = params[0].split("=")
		var no = parseInt(parts[1]) // only video id is used
		this.videoManager.persistById(no)
	} else if (this.parsedurlinfo.id == "videomgt" || this.parsedurlinfo.id == "form") {
		var view = this.videoView
		view.render(null)
	} else {
		console.log("[INFO] return one video, because id = '"+this.parsedurlinfo.id+"'");
		var no = parseInt(this.parsedurlinfo.id)
		this.videoManager.findById(no)
	}
}

module.exports.VideoController = VideoController