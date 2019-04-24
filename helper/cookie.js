// Helper for "/controller/cookie_contr.js"

function Cookie(name, v, timeToLive){
	this.name = name
	this.value = v
	var expireOn = new Date()
	expireOn.setDate( expireOn.getDate() + timeToLive) // + x means expire in x days || 0 => delete cookie
	this.expires=expireOn.toUTCString()
}

Cookie.prototype.toString = function(){
	var result = this.name + " = " + this.value;
	if(this.expires) result += "; expires="+this.expires;
	result += "; path=/"; // save for root directory
	
	return result;
}

module.exports = Cookie