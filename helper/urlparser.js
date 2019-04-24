// Helper for "/controller/master.js"
// -> used in each controller to split Url into parts:
//	-lang
//	-path
//	-resource
//	-id
//	-format
//	-params

var config = require('../config.js')

// e.g. url = "/public/pictures/image/logo.png?lan=en";
UrlParser = function(request, body){
	this.req = request
	this.url = request.url;
	this.controller = "";
	this.path = "";
	this.resource = "";
	this.id = null;
	this.format = null;
	this.params = {};
	this.body = body || "";
	this.language = null;
	
	this.debug = config.debug
	
	this.parse();
}

UrlParser.prototype.parse=function(){
	var debug = this.debug
	// e.g. this.url = "/public/pictures/image/logo.png?lan=en";
	
	parts = this.url.split('/');
	parts = this.unique(parts);
	// => parts = [ '', 'public',   'pictures',   'image',   'logo.png?lan=en&perpage=5' ]
	if (debug)
		console.log("[DEBUG] url-parts=",parts)
	
	fileandparam = parts.pop()
	// => fileandparam = 'logo.png?lan=en&perpage=5'
	// => and parts = [ '', 'public', 'pictures', 'image' ]
	
	this.path = parts.join("/")
	if (parts.length > 1){
		this.resource = parts.pop()
		
		// => resource = 'image'
		// => and parts = [ '', 'public', 'pictures' ]
	} else {
		this.resource = "page"
	}
	
	var lang = parts.pop();
	// if it gives a lang variable in the url
	// then => set the language for the site
	// if not => set the default language
	if (lang == "de" || lang == "en") {
		this.language = lang;
	} else { // default is english
		this.language = config.language;
		this.path = "/" + this.language + this.path;
	}
	if (debug)
		console.log("[DEBUG] language is " + this.language);

	if (fileandparam) {
		fileandparamlist=fileandparam.split("?")
		// fileandparamlist = ['logo.png','lan=en&perpage=5']
	
		if ( fileandparamlist.length >1 ) { // ? was given
			paramstr=fileandparamlist.pop()
			// => paramstr = 'lan=en&perpage=5'
			fileWithSuffix=fileandparamlist[0] || ""
		}else{ // no ? given, i.e. no params => only one element in list
			paramstr=""
			fileWithSuffix=fileandparamlist.pop()
		}
		
		var suffixParams = fileWithSuffix.split(".");
		
		// fileWithSuffix = 'logo.png'
		this.id     = suffixParams[0]
		this.format = "html";
		// if format is missing, then format is set to html by default
		if (suffixParams.length > 2) {
			this.format = suffixParams[1] + "." + suffixParams[2];
		} else {
			this.format = suffixParams[1];
		}
	
		// we extract all the key-value pairs of the parameters 
		// into the dict this.params={}
		params={}
		// for e.g. paramstr = 'lan=en&perpage=5'
		paramstr && paramstr.split("&").forEach( function(keyval){
			if (debug) 
				console.log("[DEBUG] keyval=",keyval)
			keyvals = keyval.split("=")
			if (debug) 
				console.log("[DEBUG] keyvals=",keyvals)
			k=keyvals[0]
			v=keyvals[1]
			if (debug) 
				console.log("[DEBUG] params=",params)
			params[k]=v // we are inside a closure and cannot access this.params
		})
		this.params = params
	}else{
		if (debug) 
			console.log("[DEBUG] no files and parameters given with url '"+this.url+"'")
		this.id       = "welcome"
		this.format   = "html"
	}
	console.log("[INFO] path      = '"+this.path+"'")
	console.log("[INFO] resource  = '"+this.resource+"'")
	console.log("[INFO] id        = '"+this.id+"'")
	console.log("[INFO] format    = '"+this.format+"'")
	console.log("[INFO] params    = '",this.params,"'")
}

UrlParser.prototype.unique=function(origArr) {
	var newArr = [],
		origLen = origArr.length,
		found,
		x, y;
  
	for (x = 0; x < origLen; x ++) {
		found = false;
		for ( y = 0; y < newArr.length; y++ ) {
			if ( origArr[x] === newArr[y] ) { 
				found = true;
				break;
			}
		}
		if (!found) newArr.push( origArr[x] );    
	}
	return newArr;
}

module.exports.UrlParser=UrlParser