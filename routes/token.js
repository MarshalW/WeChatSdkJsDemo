var express = require('express');
var request = require('request');
var sign=require('../libs/sign');//微信提供的签名方法
var config=require('../libs/config.json');//配置文件
var router = express.Router();

/* 最简单的获取签名信息 */
router.get('/', function(req, res) {
	request('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+config.appId+'&secret='+config.appSecret, function (error, response, body) {
		console.log('根据appId和appSecret获取accessToken ..');
		if(error || response.statusCode != 200){
			res.send(error);
			return;
		}
		var access_token=JSON.parse(body).access_token;
		console.log('access_token: '+access_token);
		
		request('https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token='+access_token+'&type=jsapi', function (error, response, body) {
			console.log('根据accessToken获取..');
			if (error || response.statusCode != 200) {
				res.send(error);
				return;
			}

		  	var ticket=JSON.parse(body).ticket;
		  	console.log('ticket: '+ticket);

		  	var port = req.app.settings.port;
		  	var url=req.protocol + '://' + req.host  + ( port == 80 || port == 443 ? '' : ':'+port ) + req.path;
		  	var result=sign(ticket,url);

		  	res.send(result);
		});
	});  
});

var globalToken={};
var max_live=7200-1000;

/* 正式的演示代码，包括服务器端生成签名，客户端通过签名使用微信API方法 */
router.get('/client', function(req, res) {
	var now=new Date().getTime()/1000;

	if (!globalToken.time || now-globalToken.time>max_live){
		refreshGlobalToken(req,res,function(){
			console.log('获取新的token');
			renderClient(req,res);
		})
	}else{
		console.log('重复使用token');
		renderClient(req,res);
	}
});	

function refreshGlobalToken(req,res,callback){
	request('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+config.appId+'&secret='+config.appSecret, function (error, response, body) {
		console.log('根据appId和appSecret获取accessToken ..');
		if(error || response.statusCode != 200){
			res.send(error);
			return;
		}
		var access_token=JSON.parse(body).access_token;
		console.log('access_token: '+access_token);
		
		request('https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token='+access_token+'&type=jsapi', function (error, response, body) {
			console.log('根据accessToken获取..');
			if (error || response.statusCode != 200) {
				res.send(error);
				return;
			}
		  
		  	var ticket=JSON.parse(body).ticket;
		  	console.log('ticket: '+ticket);

		  	globalToken.time=new Date().getTime()/1000;
		  	globalToken.ticket=ticket;
		  	callback();
		});
	});  
}

function renderClient(req,res){
	var port = req.app.settings.port;
	var url=req.protocol + '://' + req.host  + ( port == 80 || port == 443 ? '' : ':'+port ) + req.path;
	var result=sign(globalToken.ticket,url);
	res.render('client',{config:config,result:result});
}

module.exports = router;
