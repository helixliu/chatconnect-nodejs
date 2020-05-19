//  OpenShift sample Node application
var config = require('./config/config.json'),
    express = require('express'),
    app     = express(),
    wechatutils  = require('./common/wechatutils'),
    wechat = require('wechat');
;

const tencentcloud = require("tencentcloud-sdk-nodejs");

    
var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

app.use('/wechatconnect',wechatutils.sign(config));

app.use(express.query());
app.use('/wechatconnect',
    wechat(config.wechat, 
        function (req, res, next) {
            var message = req.weixin;
            console.log(message); 
            if (message.MsgType == "text") {
    		    res.reply({
        		    content: message.Content,
        		    type: "text"
    		    });
            }else  if (message.MsgType == "image") {
                //用来保存OCR识别出来的文字 ； 由于tencent识别出来的是数组形式，在下面调用返回结果中我们会循环取出
            	ocr_text = "";
		   		
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
                client.GeneralFastOCR(ocrreq, function(err, response) {
                 // 请求异常返回，打印异常信息
                    if (err) {
                        console.log(err);
                        return;
                    }
                    // 请求正常返回，打印response对象
                    console.log(response.to_json_string());
                    //遍历取出OCR的结果
                    ocr_text_json = JSON.parse(response.to_json_string());
                    for(var x=0;x< ocr_text_json.TextDetections.length;x++){
                    	ocr_text = ocr_text + ocr_text_json.TextDetections[x].DetectedText;
                    }		    
                });
		    
		    
    		    res.reply({
        		    content: ocr_text_json,
        		    type: "text"
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
