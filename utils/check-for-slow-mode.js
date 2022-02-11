const logger = require("./logger");

if (process.env.SLOW_MODE) {
    logger.warn('Running with SLOW_MODE enabled...');

    browser.throttle({
        latency: 4000,
        offline: false,
        downloadThroughput: 1000000,
        uploadThroughput: 1000000
    });
} else {
    logger.info('To run in slow mode, use SLOW_MODE env variable: \n' + '    $ SLOW_MODE=true npx wdio');
}


