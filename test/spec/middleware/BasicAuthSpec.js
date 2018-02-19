/**
 *
 */
require('../../util/TestUtils');
const expect = require('chai').expect;
const sinon = require('sinon');
const auth = requireSrc('middleware/basic-auth');
const extend = require('object-util').extend;

describe('basic-auth middleware', () => {
    let req = {
            headers: {},
            get: function(name){
                return this.headers[name];
            }
        };
    let res = {
            headers: {},
            set: function(name, value){
                this.headers[name] = value;
            },
            status: function(statusCode){
                return {
                    status: statusCode,
                    message: null,
                    send: function(value){
                        this.message = value;
                    }
                }
            }
        };
    let authHeader = { 'authorization': 'Basic aaaabbbbccc'};
    let get, set, status;


    function next(){}

    // Creating spies before the class starts.
    before(() => {
        get = sinon.spy(req, 'get');
        set = sinon.spy(res, 'set');
        status = sinon.spy(res, 'status');
    });

    // Resetting spies after each test.
    afterEach(() => {
        get.reset();
        set.reset();
        status.reset();
    });


    it('should set a www-authentication header when the authorization header has not been set', () => {
        auth(req, res, next);
        sinon.assert.calledWith(set, 'WWW-Authenticate', "Basic realm=\"Authorization Required\"");
        sinon.assert.calledWith(status, 401);
    });

    it('should not set a www-authentication header when the authorization header has been set', () => {
        extend(req.headers, authHeader);
        auth(req, res, next);
        sinon.assert.notCalled(set);
        sinon.assert.notCalled(status);
    });
});