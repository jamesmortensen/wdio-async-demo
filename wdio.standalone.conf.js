// wdio.standalone.conf.js

/*
 This configuration starts no services but expects Selenium to be running on 4444 or
 some port overridden with -p.

 This configuration and its derivatives also allow passing the port WebdriverIO uses
 to connect to a WebDriver instance.

 From the WebdriverIO docs:
 $ npx wdio wdio.standalone.conf.js -p 4445

 Since this configuration uses no services, it's up to us to start whatever services we need 
 prior to running the tests.  This could be a chromedriver instance, Selenium server, Selenium Grid
 Selenoid, or Docker containers representing any of these components.
 
*/

const merge = require('deepmerge');
const config = {};
config.default = require('./wdio.conf.js').config;

// insert modified configuration inside
config.override = {
    debug: false,
    execArgv: [],
    host: 'localhost',
    port: 4444,
    path: '/wd/hub',
    automationProtocol: 'webdriver',
    capabilities: [{
        maxInstances: 1,
        browserName: 'chrome'
        /*'goog:chromeOptions': {
            args: [
                '--headless',
                '--window-size=1280,800'   // required with headless option
            ]
        }*/
    }],
    sync: true,
    logLevel: 'warn',
    services: []
};

// overwrite any arrays in default with arrays in override.
const overwriteMerge = (destinationArray, sourceArray, options) => sourceArray;

// have main config file as default but overwrite environment specific information
exports.config = merge(config.default, config.override, { arrayMerge: overwriteMerge, clone: false });
