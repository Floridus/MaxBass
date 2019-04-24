"use strict"

var Video = function(id, title, owner, length, category, source, level, description) {
	this.id = id
	this.title = title
	this.owner = owner || "unknown" // video owner
	this.length = length || "XX:XX" // video length
	this.category = category // witch category
	this.source = source || "" // where is the file
	this.level = level // difficulty level
	this.description = description || "this is a test description..."
}

Video.prototype.toString = function(){
	return "This is video '"+this.title+"'."
}

module.exports.Video = Video