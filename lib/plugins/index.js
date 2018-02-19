/**
 * Plugin loader.
 *
 * Paths to configured plugins are relative to this file.
 */

/* istanbul ignore next */
module.exports = function inject(local){

    const cfg = local.plugins || [];
    cfg.forEach(path => {
        require(`./${path}`)(local);
    });

};

