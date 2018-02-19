/**
 * Unit tests for ConfigUtils
 */

'use strict';

describe('ConfigUtils', function () {
    require('../../util/TestUtils');
    let nconf = require('nconf');
    const chai = require('chai');
    const sinon = require('sinon');
    const utils = requireSrc('util/ConfigUtils');
    const expect = chai.expect;
    let fs = require('fs');
    let stub;

    describe('parseCerts()', function () {
        beforeEach(() => {
            stub = sinon.stub(nconf, "get");
            stub.returns({
                "certLocation": "./test",
                "certs": {
                    "key": "/certs/server/privkey.pem",
                    "cert": "/certs/server/cert.pem",
                    "ca": [
                        "/certs/ca/my-root-ca.crt.pem"
                    ]
                }
            });
        });

        afterEach(() => {
            nconf.get.restore();
        });

        it('should find the certs', function () {
            let certs = utils.parseCerts();
            expect(certs.key).to.exist;
            expect(certs.cert).to.exist;
            expect(certs.ca).to.be.an('Array');
        });

        /*
         NOTE: Since I am no longer passing the config as a parameter, I cannot
         set the cert value to null for this test easily.
         */
        it('should not throw an error if no certs are configured', function () {
            let certs;
            stub.returns({
                "certLocation": "./test",
                "certs": null
            });

            expect(function () {
                certs = utils.parseCerts();
            }).not.to.throw(Error);

            expect(certs).to.be.null;

        });

        it('should default to the CWD to find the certs if certLocation is not set', () => {
            let certs, file;
            let readFileSync = sinon.stub(fs, 'readFileSync').callsFake(function(f, encoding){
                if (f.includes('cert.pem')){
                    file = f;
                }
            });
            stub.returns({
                "certs": {
                    "key": "certs/server/privkey.pem",
                    "cert": "certs/server/cert.pem",
                    "ca": [
                        "certs/ca/my-root-ca.crt.pem"
                    ]
                }
            });
            utils.parseCerts();
            expect(file).to.equal('./certs/server/cert.pem');
        })
    });
});
