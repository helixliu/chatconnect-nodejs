//  OpenShift sample Node application
var config = require('./config/config.json'),
    express = require('express'),
    app     = express(),
    wechatutils  = require('./common/wechatutils');
    
var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

app.use('/wechatconnect',wechatutils.sign(config));

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
