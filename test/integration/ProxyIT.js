/**
 * Integration tests for the proxy server.  The app configuration for these tests
 * is "test," and the configuration file is config/test.json.
 */
describe('aurora-proxy', () => {
    const request = require('request'),
        chai = require('chai'),
        expect = chai.expect,
        fs = require('fs'),
        util = require('../util/TestUtils'),
        testServer = require('../test-server'),
        del = require('del');
    let baseUrl,
        proxy;


    before(() => {
        baseUrl = 'http://localhost:3002';
        testServer.start({
            httpPort: 13550,
            on: function(){
                proxy = require('../../server');
            }
        });
    });

    after(done => {
        testServer.stop();
        proxy.http.stop(done);
    });

    it('should redirect to the configured destination', done => {
        request(baseUrl + "/home", (error, response, body) => {
            if (error){
                console.log(error);
            }
            expect(response.statusCode).to.equal(200);
            expect(body).to.equal('Congratulations, you have reached the home page.');
            done();
        });
    });


    it('should rewrite and redirect to the rewritten URL', done => {
        request(baseUrl + "/batch/15/patient/3668", (error, response, body) => {
            if (error){
                console.log(error);
            }
            expect(response.statusCode).to.equal(200);

            const msg = JSON.parse(body);
            expect(msg.firstName).to.equal('John');
            done();
        });
    });

    it('should handle 404s without crashing', done => {
        request(baseUrl + "/batchId15+patientId3668", (error, response, body) => {
            if (error){
                console.log(error);
            }
            expect(response.statusCode).to.equal(404);
            expect(body).to.equal("/batchId15+patientId3668 not found");
            done();
        });
    });

    it('should accept rewrites from config.rewrites', done => {
        request(baseUrl + "/index.html?action=logout", (error, response, body) => {
            if (error){
                console.log(error);
            }
            expect(response.statusCode).to.equal(200);
            expect(body).to.equal("You are about to be logged out.");
            done();
        });
    });

    it('should set the active HTTPS port to undefined if it is configured as -1', () => {
        expect(proxy.getActivePorts().httpsPort).to.be.undefined;
    });


    it('should allow read access to the runtime configuration', done => {
        request(baseUrl + "/proxy/config/", (error, response, body) => {
            if (error){
                console.log(error);
            } else {
                console.log(body);
                const json = JSON.parse(body);
                expect(response.statusCode).to.equal(200);
            }
            done();
        });
    });


    it('should not crash if the requested configuration file is not found.', done => {
        request(baseUrl + "/proxy/config/whco", (error, response) => {
            if (error){
                console.log(error);
                expect.fail(1, 0, 'We should not reach this point');
            } else {
                expect(response.statusCode).to.equal(404);
            }
            done();
        });
    });

});


