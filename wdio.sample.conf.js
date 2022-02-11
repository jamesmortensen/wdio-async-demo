// wdio.sample.config.js


const merge = require('deepmerge');
const config = {};
config.default = require('./wdio.conf.js').config;

const video = require('wdio-video-reporter');

// insert modified configuration inside
config.override = {
    debug: false,
    execArgv: ['--inspect=127.0.0.1:9229'],
    logLevel: 'warn',
    /**
     * Level of logging verbosity for the logger statements inside your spec files,
     * page objects, and step files: // trace|log|debug|info|warn|error
     */
    specLogLevel: 'trace',
    mochaOpts: {
        ui: 'bdd',
        // 20 minutes - larger value helps prevent the browser closing while debugging
        timeout: 1200000
    },
    reporters: [
        [video, {
            saveAllVideos: false,       // If true, also saves videos for successful test cases
            videoSlowdownMultiplier: 3, // Higher to get slower videos, lower for faster videos [Value 1-100]
        }],
        ['allure', {
            outputDir: 'allure-results',
            disableWebdriverStepsReporting: true,
            disableWebdriverScreenshotsReporting: false,  // Video will not record if false
        }], 'spec'
    ]
};

// overwrite any arrays in default with arrays in override.
const overwriteMerge = (destinationArray, sourceArray, options) => sourceArray;

// have main config file as default but overwrite environment specific information
exports.config = merge(config.default, config.override, { arrayMerge: overwriteMerge, clone: false });