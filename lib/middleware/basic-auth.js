/**
 * Forces the browser to authenticate the user.
 */

module.exports = function(req, res, next) {
    if (!req.get('authorization')) {
        res.set("WWW-Authenticate", "Basic realm=\"Authorization Required\"");
        res.status(401).send("Authorization Required");
    } else {
        next();
    }
};