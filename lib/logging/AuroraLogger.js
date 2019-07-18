/**
 *  Aurora's instance of winston.
 */
const winston = require('winston');
const augment = require('object-util').augment;
const nconf = require('nconf');

/*
Log levels:
The lower you set the log level, the more inclusive the logging will be.
Thus, off turns off logging, since no messages reach that level.  Furthermore,
since debug is almost the lowest setting, it includes almost all messages.
And since debug is lower than info, if the level is set to "info," debug messages
wil NOT be printed.
 */
const levels = {
    off: 7,
    fatal: 6,
    error: 5,
    warn: 4,
    info: 3,
    debug: 2,
    all: 1
};
const logConfig = nconf.get('logging') || {};
const logger = winston.createLogger({
    levels: levels,
    transports: [
        new winston.transports.Console(augment(logConfig, {level: 'error', colorize: true}))
    ]
});

if (logConfig.filename) {
    logger.add(new winston.transports.File(augment(logConfig, {level: 'fatal', handleExceptions: true})));
}

function decorate(type, varargs){
    logger[type].apply(logger, varargs);
}

module.exports = {
    log: (...varargs) => {
        decorate('log', varargs);
    },
    info: (...varargs) => {
        decorate('info', varargs);
    },
    warn: (...varargs) => {
        decorate('warn', varargs);
    },
    debug: (...varargs) => {
        decorate('debug', varargs);
    },
    error: (...varargs) => {
        decorate('error', varargs);
    },
    off: () => {
        // handles users calling LOGGER.off().
        throw new Error('Please don\'t call the off() method again.');
    }
};