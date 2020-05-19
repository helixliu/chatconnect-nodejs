//  OpenShift sample Node application
var config = require('./config/config.json'),
    express = require('express'),
    app     = express(),
    utils  = require('./common/utils');
    
app.use(morgan('combined'))

var port = process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || 8080,
    ip   = process.env.IP   || process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0';

app.use(utils.sign(config));

app.listen(port, ip);
console.log('Server running on http://%s:%s', ip, port);

module.exports = app ;
