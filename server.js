/**
 * <h2>Aurora Reverse Proxy Server</h2>
 *
 * Options
 * 1) (Optional) conf=path/to/configuration/file
 *
 */
const args = require('minimist')(process.argv);
const nconf = require('nconf');

nconf.argv()
    .env([
        'certLocation',
        'httpsPort',
        'httpPort',
        'logging'
    ]);
const conf = args.conf;

/* istanbul ignore if */
if (conf){
    nconf.file({file: conf});
}
nconf.defaults(require('./config/default.json'));


const express = require('express'),
    httpProxy = require('http-proxy'),
    apiProxy = httpProxy.createProxyServer({autoRewrite: true}),
    https = require('https'),
    cors = require('cors'),
    config = nconf.get(),
    requireDir = require('require-dir'),
    app = express(),
    router = express.Router(),
    rewrite = require('express-urlrewrite'),
    LOGGER = require('./lib/logging/AuroraLogger'),
    _ = require('underscore'),
    cutil = require('./lib/util/ConfigUtils'),
    MiddleWare = require('./lib/util/Middleware'),
    sslOptions = cutil.parseCerts(),
    baseOptions = {ssl: sslOptions, secure: false},
    /* istanbul ignore next */
    headers = config.headers || {},
    activePorts = {};

let urlMappings = config.urlMappings,
    server,                                                              // This server
    httpsServer;                                                         // This server.


LOGGER.debug("headers", headers);
LOGGER.debug("mappings", config.urlMappings);

//============================================================ Functions




//============================================================ Middleware

// Handle CORS
app.use(cors());


LOGGER.debug('mappings', urlMappings);

// For config.rewrites
for (let i in config.rewrites){
    /* istanbul ignore next */
    if (config.rewrites.hasOwnProperty(i)) {
        app.use(rewrite(i, config.rewrites[i]));
    }
}

/*
 Creating a separate route for each mapping.
 */
urlMappings.forEach(mapping => {
    LOGGER.debug("new URL Mapping", mapping.path, mapping.target);
    /*
    paford (2016/12/24):
    If the mapping has a rewrite.  Add an app.all() call, with the original URL as the
    key and the rewrite(newUrl) as the value.  The outcome of that call will be passed to
    and handled by the next app.all() call maps the new re-written URL to the target.
    */
    if (mapping.rewrite){
        LOGGER.debug("mapping rewrite", mapping.rewrite.from, mapping.rewrite.to);
        app.all(mapping.rewrite.from, rewrite(mapping.rewrite.to));
    }
    // Default middleware, always executed.
    let middleware = new MiddleWare((req, res, next) => {
        LOGGER.debug("routing....", mapping.path, mapping.target, req.url);
        LOGGER.debug('headers', headers);
        res.header(headers);

        let options = _.extend({}, baseOptions, mapping);
        apiProxy.web(req, res, options);
    });
    middleware.addAdvice(mapping);
    LOGGER.debug("mw: " + middleware.length);
    // app.use/all can take an array of middleware anywhere after the path.
    app.all(mapping.path, middleware.items);
});



/*
For aiding automation.
 */
router.get('/proxy/config/', (req, res) => {
    res.json(config);
});
app.use(router);



/*
Static apps
 */
/* istanbul ignore if */
if (config.root) {
    app.use(express.static(config.root));
}


/*
If no route is matched, return a 404.
 */
app.use((req, res) => {
    const msg = `${req.path} not found`;
    LOGGER.info(msg);
    res.status(404).send(msg);
});



/*
Executing configured plugins:

Plugins add capabilities to the server, other than the request-handling added by middleware.
Plugins are configured by arbitrary properties in the config file.
 */
require('./lib/plugins')(config);   // Must come after the routes.



//=========================================================== Public
const api = {

    https: {
        start: function (port) {
            if (port && port > 0) {
                httpsServer = https.createServer(sslOptions, app).listen(port, () => {
                    activePorts.httpsPort = port;
                    LOGGER.info(`Starting aurora-proxy on HTTPS port ${port}....`);
                });
            }
        },
        stop: function(cmd = () => {}){
            /* istanbul ignore else */
            if (httpsServer) {
                httpsServer.close(() => {
                    LOGGER.info('Stopping the HTTPS proxy server.');
                    delete activePorts.httpsPort;
                    cmd();
                });
            }
        },
    },

    http: {
        start: function (port) {
            if (port && port > 0) {
                server = app.listen(port, () => {
                    activePorts.httpPort = port;
                    LOGGER.info(`Starting aurora-proxy on HTTP port ${port}....`);
                });
            }
        },
        stop: function(cmd = () => {}) {
            /* istanbul ignore else */
            if (server) {
                server.close(() => {
                    LOGGER.info('Stopping the HTTP proxy server.');
                    delete activePorts.httpPort ;
                    cmd();
                });
            }
        }
    },

    getActivePorts: function(){
        return activePorts;
    },

    // For testing and debugging
    getUrlMappings: function(){
        return urlMappings;
    }
};

api.http.start(config.httpPort);
api.https.start(config.httpsPort);
module.exports = api;
