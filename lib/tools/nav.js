/**
 * 获取导航数据
 */
var	pathModule = require("path"),
	urlModule = require('url'),
	jsdom = require("jsdom"),
	S = require('kissy'),
	Utils = require("./utils"),
	readMd = require("./read-md");

// 将jsdom没用的特性都关掉
jsdom.defaultDocumentFeatures = {
    // 不需要载入外部资源
    FetchExternalResources: false,
    // 不需要处理外部资源
    ProcessExternalResources: false,
    // 关掉随机的事件响应（处于性能考虑）
    MutationEvents: false,
    // 不需要浏览器自带的Css选择器
    QuerySelector: false
};

// 设置当前选中的导航选项
var setCurrent = function(nav, currentKey){
	S.each(nav, function(n){
		if(currentKey && currentKey === n.key){
			n.isCurrent = true;
		}else{
			n.isCurrent = false;
		}
	});
	return nav;
};

// 获取主导航
var getNavData = function(config, data, url, currentKey){
	var nav = [];
	
	S.each(data, function(d){
		var obj = {
			title: d.title,
			key: d.key,
			url: urlModule.resolve(url, d.key)
		};
		// 计算模块数量
		if(d.module){
			obj.num = d.module.length || 0
		}
		nav.push(obj);
	});

	nav = setCurrent(nav, currentKey);
	
	return S.clone(nav);
};

// 获取模块二级导航
var getSecondNavData = function(config, moduleList, url, currentKey){
	var srcPath = config.srcPath,
		secondNav = [];

	S.each(moduleList, function(moduleName){
		var moduleJson = Utils.getJSONSync(pathModule.join(srcPath, moduleName, 'module.json'));
		var obj = {
			title: moduleJson.name || moduleName,
			key: moduleName,
			url: urlModule.resolve(url, moduleName),
			author: moduleJson.author ? (moduleJson.author.dev || []) : []
		}
		secondNav.push(obj);
	});

	secondNav = setCurrent(secondNav, currentKey);
	
	return S.clone(secondNav);
};

// 获取说明列表二级导航
var getIntroduceNavData = function(config, introduceList, url, cfg){
	var secondNav = [],
		currentKey = cfg.currentKey,
		srcPath = cfg.srcPath;
	
	S.each(introduceList, function(introduceName){

		var introduceFile = readMd.read(pathModule.join(srcPath, introduceName)),
			introduceDocument = jsdom.jsdom(introduceFile),
			introduceWindow = introduceDocument.createWindow(),
			_key = introduceName.replace('.md', ''),
			titleElm = introduceDocument.getElementsByTagName('h1')[0],
			obj = {
				title: titleElm ? titleElm.innerHTML : '',
				key: _key,
				url: urlModule.resolve(url, _key)
			};
			
		console.log('introduce title: ' + obj.title);
		secondNav.push(obj);
	});

	secondNav = setCurrent(secondNav, currentKey);
	
	return S.clone(secondNav);
};

module.exports.setCurrent = setCurrent;
module.exports.getNav = getNavData;
module.exports.getSecNav = getSecondNavData;
module.exports.getIntroduceNav = getIntroduceNavData;
