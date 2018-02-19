/**
 * A helper class for adding middleware dynamically.
 */
function Middleware(item) {
    this.items = [];
    this.items.push(item);
    this.length = this.items.length;
}

let prefix = 'classpath:';   //Supported file prefixes.


//Middleware.prototype = [];  // Extending array broke Express.all().  Had to keep an array property instead.
Middleware.prototype.require = function(...items){
    items = [...items];
    return items.map(item => {
        /* istanbul ignore else */
        if (typeof item === 'string'){
            if (item.startsWith(prefix)){
                item = item.replace(prefix, "../middleware/");
            }
            return require(item);
        }
        /* istanbul ignore next */
        return item;
    });
};
Middleware.prototype.prepend = function(...items) {
    this.items.unshift.apply(this.items, this.require(...items));
    return this;
};
Middleware.prototype.append = function(...items) {
    this.items.push.apply(this.items, this.require(...items));
    return this;
};

Middleware.prototype.addAdvice = function(mapping){
    // Unshift before advice into the front of the array.
    if (mapping.before){
        this.prepend(...mapping.before);
    }
    // Push after advice into the back of the array.
    if (mapping.after){
        this.append(...mapping.after);
    }
};

module.exports = Middleware;
