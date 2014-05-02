/**
 * @author: zheng.fuz[at]alibaba-inc.com
 * @date: 2012-07-05 14:33
 * 工具集
 */

var fs = require("fs"),
	pathModule = require("path"),
	urlModule = require("url"),
	utilModule = require("util"),
	http = require('http'),
	querystring = require('querystring'),
	S = require('kissy').KISSY,
	exec = require('child_process').exec,
	md5 = require("MD5");

var Utils = {};

// 获取文件json对象
Utils.getJSONSync = function(path){
    var fileCon = Utils.getFileSync(path),
    	data = {};
    if(fileCon){
    	fileCon =fileCon.replace(/ \/\/[^\n]*/g, '');
        data = JSON.parse(fileCon);
    }
    return data;
};
Utils.getFileSync = function(path){
	var fileCon = '';
    if(fs.existsSync(path)){
    	fileCon = fs.readFileSync(path, "utf8");
    }
    return fileCon;
};

// 获取远程json对象
Utils.getJSONP = function(url, callback, errorCallback){
	Utils.getUrl(url, function(data){
		if(data.indexOf('<html>') > -1){
			if(errorCallback){
				errorCallback();
			}
		}else{
			// 兼容转换
			data = Utils.jsonTrans(data);
			callback(JSON.parse(data), errorCallback);
		}
	});
};
// 发送get请求
Utils.getUrl = function(url, callback, errorCallback){
	var resultData = '';
	http.get(url, function(res) {
		res.setEncoding('utf8');
		res.on('data', function(data){
			resultData += data;
		});
		res.on('end', function(){
			callback(resultData);			
		});
	}).on('error', function(e) {
		console.log("Got error: " + e.message);
		if(errorCallback){
			errorCallback(e.message);
		}
	});
};
// 发送post请求
Utils.postUrl = function(url, data, contentType, callback){
	contentType = contentType || 'application/x-www-form-urlencoded';
	var resultData = '',
		option = urlModule.parse(url),
		sendData = querystring.stringify(data),
		req;
		
	option.method = 'POST';	
	option.headers ={  
		"Content-Type": contentType,  
		"Content-Length": sendData.length  
	};
		
	req = http.request(option, function(res) {
		res.setEncoding('utf8');
		res.on('data', function(data){
			resultData += data;
		});
		res.on('end', function(){
			callback(resultData);			
		});
	})
	req.on('error', function(e) {
		console.log("Got error: " + e.message);
	});
	req.write(sendData + "\n");  
    req.end(); 
};

// 读取文件夹，过滤 .svn 文件
// type: 'dir', 'file', 'all' - 默认
Utils.readdirSync = function(path, type){
	var files = [],
		_files = [];
	if(fs.existsSync(path)){
		var stats = fs.statSync(path);
		if(stats.isDirectory()){
			_files = fs.readdirSync(path) || [];
		}
	}
	S.each(_files, function(f){
		if(filterDir(f)){
			if(filterFileType(pathModule.join(path, f), type)){
				files.push(f);
			}
		}
	});
	return files;
};

// 读取文件夹-异步，过滤 .svn 文件
Utils.readdir = function(path, callback, type){
	if(fs.existsSync(path)){
		var stats = fs.statSync(path);
		if(stats.isDirectory()){
			fs.readdir(path, function(err, files){
				files = files || [];
				var _files = [];
				S.each(files, function(f){
					if(filterDir(f)){
						if(filterFileType(pathModule.join(path, f), type)){
							_files.push(f);
						}
					}
				});
				callback(err, _files);
			});	
		}
	}
};

// 过滤文件名
var filterDir = function(name){
	var noReadList = ['.svn', '.DS_Store', '._.DS_Store', '.git', '.gitignore'];
	if(!S.inArray(name, noReadList)){
		return true;
	}else{
		return false;
	}
};
// 过滤文件类型
// type: 'dir', 'file', 'all' - 默认
var filterFileType = function(path, type){
	var isDirectory = fs.statSync(path).isDirectory(),
		status = true;
	if(type === 'dir' && !isDirectory){
		status = false;
	}else if(type === 'file' && isDirectory){
		status = false;
	}
	return status;
};

// 递归执行代码
// deepFunc: 单项值、回调
// cumulateFunc: 单项结果，单项值、deep
var deepDo = function(list, deepFunc, cumulateFunc, callback, deep){
	deep = deep || 0;
	if(!list[deep]){
		if(callback){
			callback();
		}						
		return;
	}		
	deepFunc(list[deep], function(result){
		if(cumulateFunc){
			cumulateFunc(result, list[deep], deep);
		}
		// 递归
		if(deep + 1 < list.length){
			deepDo(list, deepFunc, cumulateFunc, callback, deep + 1);
		}else{	
			if(callback){
				callback();
			}						
		}
	});
};
Utils.deepDo = deepDo;

// 执行命令
Utils.exec = function(command, callback){
	exec(command, function(error, stdout, stderr){
		console.log(command + ' 执行中...');
		if(stdout){
			console.log('exec stdout: ' + stdout);
		}
		if(stderr){
			console.log('exec stderr: ' + stderr);
		}
		if (error) {
			console.log('exec error: ' + error);
		}
		console.log(command + ' 执行完毕！');
		if(callback){
			callback();
		}
	});
};

// 给文章增加锚点
Utils.addAnchor = function(document, el, title){
	var aAnchorLink = document.createElement('a'),
		aAnchor = document.createElement('a');
		
	aAnchorLink.href = '#' + title;
	aAnchorLink.className = 'md-anchor';
	aAnchorLink.innerHTML = '&para;';
	
	aAnchor.name = title;
		
	el.appendChild(aAnchorLink);
	document.insertBefore(aAnchor, el);
};

// 获取用户头像
Utils.getAvatar = function(email, size){
	var avatarUrl = urlModule.format({
		protocol: 'http:',
		hostname: 'www.gravatar.com',
		pathname: '/avatar/' + (email ? md5(email) : 'ad75f0855fe2f12c49d8cf8d6727e257'),
		query: {
			s: size,
			d: 'mm'
		}
	});
	return avatarUrl;
};

// 新版gitlab API中 获取json文件，会被转义，主要是换行和双引号，这里兼容下，再转义回来
Utils.jsonTrans = function(jsonStr){
	if(typeof JSON.parse(jsonStr) === 'string'){
		jsonStr = JSON.parse(jsonStr);
	}
	return jsonStr;
};

// 按版本号排序
Utils.sortVersion = function(list, getVersionFunc){
	list.sort(function(a, b){
		var _a = getVersionFunc(a).split('.'),
			_b = getVersionFunc(b).split('.'),
			sortValue = 1;
		S.each(_a, function(v, i){
			if(v*1 !== _b[i]*1){
				sortValue = _b[i]*1 - v*1;
				return false;
			}
		});
		return sortValue;
	});
	return list;
};
// 按名称排序
Utils.sortName = function(list, getNameFunc){
	list.sort(function(a, b){
		return getNameFunc(a) < getNameFunc(b) ? -1 : 1;
	});
	return list;
};

// 新建文件
Utils.writeFile = function(file, data, callback) {
    var flags = {
        flags: "w", encoding: "utf8", mode: 0644
    };
	fs.writeFile(file, data, flags, function(err) {
		if(err){
			if (err.message.match(/^EMFILE, Too many open files/)) {
				console.log('Writefile failed, too many open files (' + args[0] + '). Trying again.', 'warn', 'files');
				setTimeout(Utils.writeFile, 100, file, data, flags);
				return;
			}else{
				throw err;
			}
		}
		if(callback){
			callback();
		}
	});
};
// 新建JSON文件
Utils.writeJsonFile = function(destPath, data, isFormat, callback){
	if(isFormat){
		data = JSON.stringify(data, null, 4);
	}else{
		data = JSON.stringify(data);
	}
	Utils.writeFile(destPath, data, function(){
		console.log('build ' + destPath + ' ok!');
		if(callback){
			callback(data);
		}
	});
};

// 删除文件或文件夹
Utils.deletePathSync = function(path){
	if(fs.existsSync(path)){
		var stats = fs.lstatSync(path);
		if(stats.isFile() || stats.isSymbolicLink()){
			fs.unlinkSync(path);
		}else if(stats.isDirectory()){
			fs.readdirSync(path).forEach(function(filename){
				Utils.deletePathSync(pathModule.join(path, filename));
			});
			fs.rmdirSync(path);
		}
		console.log('delete ' + path + ' ok!');
	}
};

// 重置一个空文件夹
Utils.createNewDirSync = function(path, noReset){
	// 重置
	if(!noReset){
		Utils.deletePathSync(path);
		fs.mkdirSync(path);		
	}else{
		if(!fs.existsSync(path)){
			fs.mkdirSync(path);	
		}	
	}
};


module.exports = Utils;


