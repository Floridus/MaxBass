var Cookie = require('../helper/cookie.js');

// Calls "cookie.js" for every Cookie() Constructor
// -> toString is returned

var CookieController=function(req, res){
	this.res = res
	this.req = req
}

CookieController.prototype.addCookie=function (key, value) {
	res = this.res;
	
	var cookiesDict = this.getCookies()
	
	var respCookies = [];
	
	if (!(key in cookiesDict)) // look for the key in the dictionary
		respCookies.push( new Cookie(key, value, 7)) // if the key is not set, then push the cookie
		
	res.setHeader("Set-Cookie", respCookies)
}

CookieController.prototype.removeCookie=function (key) {
	res = this.res;
	
	var cookiesDict = this.getCookies()
	
	var respCookies = [];
	
	if (key in cookiesDict) // look for the key in the dictionary
		respCookies.push( new Cookie(key, "", 0)) // if the key is not set, then push the cookie
		
	res.setHeader("Set-Cookie", respCookies)
}

CookieController.prototype.getCookies=function () {
	req = this.req;
	
	var list = {},
        rc = req.headers.cookie;
		
	console.log("[INFO] The request cookie is: ->" + rc);

    rc && rc.split(';').forEach(function( cookie ) {
        var parts = cookie.split('=');
        list[parts.shift().trim()] = decodeURI(parts.join('='));
    });

    return list;
}

module.exports.CookieController = CookieController