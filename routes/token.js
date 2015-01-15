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

		  	var result=sign(ticket,config.url);
		  	res.send(result);
		});
	});  
});

router.get('/client', function(req, res) {
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

		  	var result=sign(ticket,config.url);

		  	//这之前，都和上面的「router.get('/', function(req, res) {..」是一样的。
		  	res.render('client',{config:config, result:result});
		});
	});  
});	

module.exports = router;
