/**
 * Utilities for working with the active configuration.
 */
const fs = require('fs');
const nconf = require('nconf');

module.exports = {

    parseCerts: function(){
        let result = null;
        let config = nconf.get();
        if (config.certs) {
            const certLocation = config.certLocation || './';
            result = {
                key: fs.readFileSync(certLocation + config.certs.key, 'utf8'),
                cert: fs.readFileSync(certLocation + config.certs.cert, 'utf8'),
                ca: config.certs.ca.map(function (ca) {
                    return fs.readFileSync(certLocation + ca, 'utf8');
                })
            };
        }
        return result;
    }
};