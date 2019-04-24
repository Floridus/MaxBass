var fs = require('fs');

var PageView = require("../view/page_view.js");

var PagesController=function(parsedurlinfo, res, cookieController){
	this.parsedurlinfo = parsedurlinfo;
	this.res = res;
	this.pageView = new PageView(parsedurlinfo, res, cookieController);
}

PagesController.prototype.handle=function () {
	console.log("INFO: Handling Page Content for: id='"+this.parsedurlinfo.id+"'");
	console.log("INFO: Handling Page Content for: format='"+this.parsedurlinfo.format+"'");

	var view = this.pageView;
	console.log("INFO: return html page");
	view.render();
}

module.exports.PagesController = PagesController