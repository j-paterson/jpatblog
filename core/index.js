// ## Server Loader
// Passes options through the boot process to get a server instance back
var server = require('./server');

// Set the default environment to be `production`
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

function makeGhost(options) {
    options = options || {};

    return server(options);
}

module.exports = makeGhost;
