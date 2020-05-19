//  OpenShift sample Node application
var config = require('./config/config.json'),
    express = require('express'),
    app     = express(),
    wechatutils  = require('./common/wechatutils'),
    wechat = require('wechat');
;
    
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
            }else {
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
