const { networkInterfaces } = require('os');
var ipAddress = '';

if (networkInterfaces().en0)
    for (var i = 0; i < networkInterfaces().en0.length; i++) {
        if (networkInterfaces().en0[i].family === 'IPv4') {
            ipAddress = networkInterfaces().en0[i].address;
        }
    }

module.exports = {
    address: ipAddress
};

