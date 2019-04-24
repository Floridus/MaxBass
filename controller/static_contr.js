var fs = require('fs');

var StaticController=function(parsedurlinfo, res){
	this.parsedurlinfo = parsedurlinfo
	this.res = res
}

StaticController.prototype.handle=function () {
	console.log("[INFO] Handling Static Content");
	
	var parsedurlinfo = this.parsedurlinfo
	var res = this.res
	
	if (parsedurlinfo.format == "png") {
		contentType = 'image/png';
	} else if (parsedurlinfo.format == "gif") {
		contentType = 'image/gif';
	} else if (parsedurlinfo.format == "css" || parsedurlinfo.format == "min.css") {
		contentType = 'text/css';
	} else if (parsedurlinfo.format == "js" || parsedurlinfo.format == "min.js") {
		contentType = 'text/javascript';
	} else if (parsedurlinfo.format == "mp4") {
		contentType = 'video/mp4';
	} else if (parsedurlinfo.format == "wmv") {
		contentType = 'video/x-ms-wmv';
	} else if (parsedurlinfo.format == "ico") {
		contentType = 'image/x-icon';
	} else {
		contentType = 'text/html';
	}
	// format is .png or .css or .js
	res.writeHead(200, {'content-type':contentType});

	if (parsedurlinfo.resource == "public")
		resource = parsedurlinfo.resource;
	else
		resource = ["public", parsedurlinfo.resource].join("/");
	
	filename = [".", resource, [parsedurlinfo.id, parsedurlinfo.format].join(".")].join("/")
	console.log("[INFO] serving static file '"+ filename+"'...")
	fs.readFile(filename, function(err, data){
		if (err){ // throw	err;
			console.log(err)
			res.end("[ERROR] File <b>" + filename + "</b> not found");
		} else {
			if (parsedurlinfo.format == "css" || parsedurlinfo.format == "js") {
				data = data.toString();
			} else if (parsedurlinfo.format == "html") {
				data = data.toString('UTF-8');
			}
			
			res.end(data);
		}
	})
}

module.exports.StaticController = StaticController