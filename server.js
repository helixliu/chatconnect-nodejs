//微信相关配置文件
var config = require('./config/config.json'),
    express = require('express'),
    app     = express(),
    //微信工具类
    wechatutils  = require('./common/wechatutils'),
    wechat = require('wechat');
;

//tencent OCR SDK
const tencentcloud = require("tencentcloud-sdk-nodejs");

    
var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

//http://wechatsrv02.okdapps.njnj.me/wechatconnect

app.use('/wechatconnect',wechatutils.sign(config));

app.use(express.query());
app.use('/wechatconnect',
    wechat(config.wechat, 
        function (req, res, next) {
            var message = req.weixin;
            console.log(message); 
            //如果是接受文本消息，简单返回
            if (message.MsgType == "text") {
    		    res.reply({
        		    content: message.Content,
        		    type: "text"
    		    });
    		    //如果是图片，尝试OCR
            }else  if (message.MsgType == "image") {
                //用来保存OCR识别出来的文字 ； 由于tencent识别出来的是数组形式，在下面调用返回结果中我们会循环取出
            	var ocr_text = "";
		   		
                // 导入对应产品模块的client models。
                const ocrClient = tencentcloud.ocr.v20181119.Client;
                const models = tencentcloud.ocr.v20181119.Models;

                const Credential = tencentcloud.common.Credential;

                // 实例化一个认证对象，入参需要传入腾讯云账户secretId，secretKey
                let cred = new Credential(process.env.TENCENTCLOUD_SECRET_ID, process.env.TENCENTCLOUD_SECRET_KEY);

                // 实例化要请求产品(以cvm为例)的client对象
                let client = new ocrClient(cred, "ap-hongkong");

                // 实例化一个请求对象
                let ocrreq = new models.GeneralFastOCRRequest();
		ocrreq.ImageUrl = message.PicUrl //发送过来的消息的url
                // 通过client对象调用想要访问的接口，需要传入请求对象以及响应回调函数
                //client.GeneralFastOCR(ocrreq, function(err, response) {
		client.GeneralBasicOCR(ocrreq, function(err, response) {    
                 // 请求异常返回，打印异常信息
                    if (err) {
                        console.log(err);
                        return;
                    }
                    // 请求正常返回，打印response对象
                    console.log(response.to_json_string());
                    /**
                    {"TextDetections":[{"DetectedText":"忘记密码?","Confidence":99,"Polygon":[{"X":665,"Y":38},{"X":1279,"Y":46},{"X":1278,"Y":150},{"X":664,"Y":142}],"AdvancedInfo":"{\"Parag\":{\"ParagNo\":1}}","ItemPolygon":{"X":667,"Y":55,"Width":615,"Height":105}},{"DetectedText":"输入您用来登录Oracle帐户的用户名(通常为您的电子","Confidence":98,"Polygon":[{"X":230,"Y":255},{"X":1647,"Y":272},{"X":1647,"Y":320},{"X":230,"Y":303}],"AdvancedInfo":"{\"Parag\":{\"ParagNo\":2}}","ItemPolygon":{"X":235,"Y":277,"Width":1418,"Height":49}},{"DetectedText":"邮件地址)","Confidence":92,"Polygon":[{"X":830,"Y":335},{"X":1084,"Y":338},{"X":1084,"Y":378},{"X":830,"Y":375}],"AdvancedInfo":"{\"Parag\":{\"ParagNo\":3}}","ItemPolygon":{"X":836,"Y":350,"Width":255,"Height":41}},{"DetectedText":"iun. zhou@havi-cn.com","Confidence":94,"Polygon":[{"X":665,"Y":501},{"X":1338,"Y":510},{"X":1338,"Y":561},{"X":665,"Y":552}],"AdvancedInfo":"{\"Parag\":{\"ParagNo\":4}}","ItemPolygon":{"X":673,"Y":518,"Width":674,"Height":52}},{"DetectedText":"提交","Confidence":99,"Polygon":[{"X":948,"Y":665},{"X":1053,"Y":666},{"X":1053,"Y":706},{"X":948,"Y":705}],"AdvancedInfo":"{\"Parag\":{\"ParagNo\":5}}","ItemPolygon":{"X":958,"Y":678,"Width":106,"Height":41}}],"Language":"zh","Angel":0.6875,"RequestId":"1f800d29-85bc-483e-ace9-80140fff1e0b"}
                    */
                    //遍历取出OCR的结果
                    var ocr_text_json = JSON.parse(response.to_json_string());
		    ocr_text = ocr_text + "【" + ocr_text_json.Language + "】" ;
                    //console.log(ocr_text_json.TextDetections);  //
                    for(var x=0;x< ocr_text_json.TextDetections.length;x++){
                    	ocr_text = ocr_text + ocr_text_json.TextDetections[x].DetectedText;
                    	//console.log("-------");
                    	//console.log(ocr_text_json.TextDetections[x].DetectedText);
                    	//console.log(ocr_text);
                    }
                    res.reply({
        		    content: ocr_text,
        		    type: "text"
    		    });		    
                });
		    
		    
    		   
            }else {//image
                res.reply({
        		    content: "hey,大哥 大哥，目前只支持文字或者图片。",
        		    type: "text"
    		    });
            }
		}
	)
);


app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;



