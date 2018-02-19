/**
 *
 */
const exec = require('child_process').exec;
const prefix = '../../lib';

global.requireSrc = function (path) {
    return require(`${prefix}/${path}`);
};

module.exports = {
    pluck: function pluck(prop, users) {
        return users.map(function (user) {
            return user[prop];
        });
    },

    getByProperty: function getByProperty(prop, value, users) {
        let result = users.filter(function (user) {
            return user[prop] === value;
        });
        if (result.length === 1) {
            result = result[0];
        }
        return result;
    },

    /**
     * Copies a file to another directory.
     * @param src The file to copy
     * @param dest The directory to copy to.
     */
    copy: function(src, dest){
        // The stream interferes with some tests.
        // dest was the new file at this point.
        //fs.createReadStream(src).pipe(fs.createWriteStream(dest));
        exec(`cp ${src} ${dest}`);
    },

    unrequire: function(path){
        delete require.cache[path];
    },

    unrequireSrc: function(path){
        delete require.cache[`${prefix}/${path}`];
    }
};
