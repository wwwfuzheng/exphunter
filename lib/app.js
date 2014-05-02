/*
	MUI Server 
	MUI文档服务
*/
var express = require('express'),
	pathModule = require('path'),
	routes = require('./routes/index'),
	Utils = require('./tools/utils'),
	buc = require('node-buc');

var config = Utils.getJSONSync("config.json"),
	app = express();

app.set('port', process.env.PORT || config.port);
app.set('views', pathModule.join(__dirname, '..', 'views'));
app.set('view engine', 'jade');
// 中间件
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
/* BUC 登录设置 */
app.use(express.cookieParser());
app.use(express.cookieSession({ secret: 'c2164048-2391-487c-91a2-d8b45c0f1982' }));
app.use(express.query());
/* End BUC */

app.use(app.router);
app.use(express.static(pathModule.join(__dirname, '..', 'public')));
app.use(express.errorHandler());

/* BUC 登录设置 */
app.use(buc(new RegExp("^\/"),{
    server: 'https://login.alibaba-inc.com/',
    account: 'tmallmui',
    loginParams: {
        // 如果你不需要证书登录, 请将下面这行去掉注释
        //CANCEL_CERT: true
    }
}));
/* End BUC */

// development only
if ('development' == app.get('env')) {

}

routes.bind(app);

// 启动服务
app.listen(app.get('port'), function(){
  console.log('MUI Server listening on port ' + app.get('port'));
});

