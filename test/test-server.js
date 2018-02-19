/**
 * A second server to be fronted by the reverse proxy in tests.
 */
// For express
var express = require('express'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    project = {
       context: '/test-server'
    },
    app = express();


//============================================================ Middleware
app.use(methodOverride());
// parse application/x-www-form-urlencoded
// Causes POST requests to hang when proxied.  See https://github.com/nodejitsu/node-http-proxy/issues/530
app.use(bodyParser.urlencoded({ extended: true }));

// parse application/json
app.use(bodyParser.json());

// URL Mappings
app.get('/home', function(req, res) {
    res.status(200).send('Congratulations, you have reached the home page.')
});


app.get('/batchID:batchId..patientID:patientId', function(req, res) {
    res.status(200).json({ firstName:  'John', lastName: 'Smith'});
});


app.get('/logout', function(req, res) {
    res.status(200).send('You are about to be logged out.');
});


//=========================================================== Public
var server;
module.exports = {
    start: function(args) {
        var port = args.httpPort,
            httpsPort = args.httpsPort,
            cmd = args.on;

        server = app.listen(port, function () {
            console.log('Starting the test server on port ' + port + '....');
            if (cmd){
                cmd();
            }
        });

        if (httpsPort) {
            //exports.startSecure(httpsPort);
            console.log('HTTPS not yet supported in the test server.');
        }

    },
    stop: function(cmd){
        server.close(function(){
            console.log('Stopping the test server.');
            if (cmd){
                cmd();
            }
        });
    }
};


