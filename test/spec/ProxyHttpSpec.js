/**
 * Unit tests for the server
 */

require('../util/TestUtils');
const nconf = require('nconf');
nconf.file({file: 'config/test.json'});
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const http = require('http');
const extend = require('underscore').extend;
let express = require('express');
let server;

describe('server.js:  http functions', () => {
    let nconf_,
        http_;


    beforeEach(() => {
        let config = nconf.get();
        nconf_ = sinon.stub(nconf, 'get');
        nconf_.returns(extend({}, config, {
            httpsPort: -1,
            httpPort: -1
        }));
        http_ = sinon.stub(http, "createServer");
        http_.returns({
            listen: function (port, cmd) {
                cmd();
                return {
                    close: function (cmd) {
                        cmd();
                    }
                }
            }
        });
        sinon.spy(express, 'static');
        server = require('../../server');
    });

    afterEach(() => {
        server.http.stop();
        nconf.get.restore();
        http.createServer.restore();
        express.static.restore();
        delete require.cache['../../server'];
    });

    it('should start an http server when the configured httpPort > -1', () => {
        server.http.start(5000);
        expect(server.getActivePorts().httpPort).to.equal(5000);
    });

    it('should not start an http server when the configured httpPort equals -1', () => {
        server.http.start(-1);
        expect(server.getActivePorts().httpPort).to.be.undefined
    });

    it('should stop the http server when stop() is called', () => {
        let result = 0;
        server.http.stop(() => {
            result = 1;
        });
        expect(result).to.equal(1);
    });

});
