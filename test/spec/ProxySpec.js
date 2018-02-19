/**
 * Unit tests for the server
 */

require('../util/TestUtils');
const nconf = require('nconf');
nconf.file({file: 'config/test.json'});
const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const https = require('https');
const extend = require('underscore').extend;
let express = require('express');
let server;

describe('server.js', () => {
    let nconf_,
        https_;


    beforeEach(() => {
        let config = nconf.get();
        nconf_ = sinon.stub(nconf, 'get');
        nconf_.returns(extend({}, config, {
            httpsPort: -1,
            httpPort: -1,
            root: '../public'
        }));
        https_ = sinon.stub(https, "createServer");
        https_.returns({
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
        server.https.stop();
        nconf.get.restore();
        https.createServer.restore();
        express.static.restore();
        delete require.cache['../../server'];
    });

    it('should start an https server when the configured httpsPort > -1', () => {
        server.https.start(5043);
        expect(server.getActivePorts().httpsPort).to.equal(5043);
    });

    it('should not start an https server when the configured httpPort equals -1', () => {
        server.https.start(-1);
        expect(server.getActivePorts().httpsPort).to.be.undefined
    });

    it('should stop the https server when stop() is called', () => {
        let result = 0;
        server.https.stop(() => {
            result = 1;
        });
        expect(result).to.equal(1);
    });


    xit('should serve resources from the configured root', function () {
        let c = nconf.get();
        ///expect(express.static.calledWith(c.root)).to.be.true;
    });

    describe('getUrlMappings', () => {
        it('should return the urlMappings from the active configuration', () => {
            let mappings = server.getUrlMappings();
            expect(mappings).not.to.be.null;
            expect(mappings.length).to.equal(4);
        })
    })
});
