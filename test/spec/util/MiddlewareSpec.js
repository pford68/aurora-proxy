/**
 *
 */
'use strict';

require('../../util/TestUtils');
let nconf = require('nconf');
const chai = require('chai');
const sinon = require('sinon');
const Middleware = requireSrc('util/Middleware');
const expect = chai.expect;
let stub;

describe('Middleware', () => {


    it ('should add unlimited beforeAdvice with prepend()', () => {
        let mw = new Middleware({ id: 'first'});
        mw.prepend('classpath:basic-auth', 'cors', '../logging/AuroraLogger');
        expect(mw.items.length).to.equal(4);
    });

    it ('should add unlimited afterAdvice with append()', () => {
        let mw = new Middleware({ id: 'first'});
        mw.append('classpath:basic-auth', 'cors', '../logging/AuroraLogger');
        expect(mw.items.length).to.equal(4);
    });

    it ('should add either before or after advice with addAdvice()', () => {
        let mw = new Middleware({ id: 'first'});
        mw.addAdvice({
            before: ['classpath:basic-auth'],
            after: ['cors', '../logging/AuroraLogger']
        });
        expect(mw.items.length).to.equal(4);
    });

    describe('require', () => {
        it('should take multiple arguments', () => {
            let mw = new Middleware({id: 'first'});
            let items = mw.require('classpath:basic-auth', 'cors');
            expect(items.length).to.equal(2);
        });

        it('should take a single argument', () => {
            let mw = new Middleware({id: 'first'});
            let items = mw.require('./ConfigUtils');
            expect(items.length).to.equal(1);
        });
    });

});
