/**
 * MUI Server 路由总入口
 */

var seedRoutes = require("./seed"),
	infoRoutes = require("./info"),
	sRoutes = require("./s"),
	moduleRoutes = require("./module"),
	userRoutes = require("./user");

var bindRoutes = function(app){

	infoRoutes.bind(app);
	
	seedRoutes.bind(app);
	
	moduleRoutes.bind(app);
		
	sRoutes.bind(app);
	
	userRoutes.bind(app);
		
};

module.exports.bind = bindRoutes;
