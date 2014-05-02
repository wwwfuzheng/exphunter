/**
 * 运用markdown 渲染说明文件
 */

var Utils = require("./utils");

// clone
var clone = function(url, modulePath, callback){
	var command = "git clone " + url + " " + modulePath;
	Utils.exec(command, callback);
};

// 发布
var push = function(modulePath, commitMsg, version, callback){
	var command = 'lib/bin/gitpush.sh ' + modulePath + ' ' + commitMsg + ' ' + version;
	Utils.exec(command, callback);
};

// 删除发布版本呢
var delTag = function(modulePath, version, callback){
	var command = 'lib/bin/gitdeltag.sh ' + modulePath + ' ' + version;
	Utils.exec(command, callback);
};

module.exports.clone = clone;
module.exports.push = push;
module.exports.delTag = delTag;
