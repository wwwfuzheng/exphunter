/**
 * 获取初始option 用来渲染模板
 */

var urlModule = require('url'),
	pathModule = require("path"),
	navData = require('./nav'),
	Utils = require("./utils");

var getDefaultOptionData = function(userInfo){

	var config = Utils.getJSONSync("config.json"),
		muiJson = Utils.getJSONSync("mui.json"),
		seedInfo = Utils.getJSONSync(pathModule.join(config.infoPath, 'seed' + config.seedInfo)),
		seedMInfo = Utils.getJSONSync(pathModule.join(config.infoPath, 'seed-m' + config.seedInfo)),
		seedGInfo = Utils.getJSONSync(pathModule.join(config.infoPath, 'seed-g' + config.seedInfo)),

		host = config.host,

		apiUrl = urlModule.resolve(host, 'module/api/'),
		dependUrl = urlModule.resolve(host, 'module/depend/'),
		seedUrl = urlModule.resolve(host, 'seed'),
		seedMUrl = urlModule.resolve(host, 'seed/m'),
		seedGUrl = urlModule.resolve(host, 'seed/g'),
		assetsUrl = urlModule.resolve(host, 'assets/'),
		indexUrl = host;

	// 获取 option
	var option = {
		url: {
			logo: config.logo,
			assets: assetsUrl,
			api: apiUrl,
			index: indexUrl,
			bug: config.bugUrl
		},
		nav:  navData.getNav(config, muiJson.module, urlModule.resolve(config.host, 'module/group/')),
		introduce: navData.getNav(config, muiJson.introduce, urlModule.resolve(config.host, 'info/group/')),
		pageTitle: ''
	};
	// 加入seed
	option.nav.push({
		key: 'seed',
		title: 'Seed ' + seedInfo[1].v,
		url: seedUrl
	});
	option.nav.push({
		key: 'seed-g',
		title: 'SeedGlobal ' + (seedGInfo[1] ? seedGInfo[1].v : '-'),
		url: seedGUrl
	});
	/*option.nav.push({
		key: 'seed-m',
		title: 'SeedMobile ' + (seedMInfo[1] ? seedMInfo[1].v : '-'),
		url: seedMUrl
	});*/
	// 加入api
	option.nav.push({
		key: 'api',
		title: 'API',
		url: apiUrl
	});
	// 加入依赖关系
	option.nav.push({
		key: 'depend',
		title: '依赖关系',
		url: dependUrl
	});
	
	if(userInfo){
		option.user = {
			name: userInfo.cname || userInfo.ssoUser.lastName,
			id: userInfo.workid,
			avatar: Utils.getAvatar(userInfo.email, 30)
		}
		option.nav.push({
			key: 'seedx',
			title: 'seed定制',
			url: '/seed/x'
		});
	}

	return option;
};

module.exports.get = getDefaultOptionData;


