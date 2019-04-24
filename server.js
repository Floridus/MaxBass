#!/usr/bin/env node

var config = require('./config.js')
var theapp = require('./controller/master.js')

theapp.startup()

console.log("-------------------------------------------------------------------------------")
console.log("[INFO] Author: " + config.author)
console.log("[INFO] MVC-Testwebserver v" + config.version)
console.log("[INFO] Server running at http://" + config.server + ":" + config.port)
console.log("-------------------------------------------------------------------------------")