// wdio.docker-app-headful.conf.js

/*
 This configuration runs in docker, but headfully, meaning not headless.
 This configuration and its derivatives also allow passing the port WebdriverIO uses
 to connect to a WebDriver instance, and the same port is used to connect the host to
 the Docker container.

 From the WebdriverIO docs:
 $ npx wdio wdio.docker-headful.conf.js -p 4445

 We can also override the default Docker image selenium/standalone-chrome-debug by 
 passing in as an argument:
 $ npx wdio wdio.docker-app-headful.conf.js --image seleniarm/standalone-chromium:4.0.0-beta-1-20210215

 Note that this configuration automatically attempts to load seleniarm/standalone-chromium if 
 the script is run on the Mac M1.
 
 This also works for the derivative WebdriverIO configurations which use the wdio-docker-service.

 In addition, this configuration also enables compatibility with an app running locally in a 
 separate docker container, as long as one of the whitelisted ports in this configuration is used
 to serve the app.
*/

const SELENIUM_SERVER_PORT = getWdioPortArgument(process.argv);
const DOCKER_IMAGE = getDockerImageArgument(process.argv);
const LOCAL_HOSTNAME = getLocalHostnameArgument(process.argv);

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
    logLevel: 'debug',
    services: ['docker'],
    dockerLogs: './',
    dockerOptions: {
        image: DOCKER_IMAGE,
        healthCheck: {
            url: 'http://localhost:' + SELENIUM_SERVER_PORT,
            maxRetries: 10,            // default 10
            inspectInterval: 1000,     // default 500ms
            startDelay: 2000           // default 0ms
        },
        options: {
            p: [SELENIUM_SERVER_PORT + ':4444', '5900:5900'],
            shmSize: '3g',
            v: [process.cwd() + ':' + process.cwd() + ':ro']
        }
    }
};

if (appIsRunningOnDocker())
    addHostnameToContainer();

function appIsRunningOnDocker() {
    return ['5000', '7080', '8080', '8888'].reduce((portFound, port) => {
        return portFound ? portFound : config.default.baseUrl.includes(port);
    }, false);
};

function addHostnameToContainer() {
    const appHostname = config.default.baseUrl.match('http[s]?:\/\/(.*)')[1].split(':')[0];
    const networkInfo = require('./networkInfo');
    config.override.dockerOptions.options.addHost = `${appHostname}:${networkInfo.address}`;
}

// overwrite any arrays in default with arrays in override.
const overwriteMerge = (destinationArray, sourceArray, options) => sourceArray;

// have main config file as default but overwrite environment specific information
exports.config = merge(config.default, config.override, { arrayMerge: overwriteMerge, clone: false });


function getWdioPortArgument(argsArr) {
    return argsValue(argsArr, '-p', '--port', '4444');
}

function getDockerImageArgument(argsArr) {
    const os = require('os');
    return argsValue(argsArr, '-i', '--image',
        !os.cpus()[0].model.includes('Apple M1')
            ? 'selenium/standalone-chrome-debug'
            : 'local-seleniarm/standalone-chromium:4.0.0-beta-2-20210622');
    //return argsValue(argsArr, '-i', '--image', 'selenium/standalone-chrome-debug');
}

function getLocalHostnameArgument(argsArr) {
    return argsValue(argsArr, '-h', '--app-hostname', 'app');
}

function argsValue(argsArr, shortForm, longForm, defaultValue) {
    return argsArr.reduce((acc, elem, index, array) => {
        if ((array[index - 1] === shortForm || array[index - 1] === longForm))
            acc = elem;
        return acc;
    }, defaultValue);
}