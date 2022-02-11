# Workshop on Getting the Most Productivity out of WebdriverIO


## Configure code quality pre-run checks: 

First, we'll configure WebdriverIO so that it checks for code quality issues before running the tests.
To do this, we'll install the eslint service and configure it.  We will need to install dependencies and modify the wdio.conf.js, and configure package.json:

Step 1: Install eslint, the eslint-plugin-import npm module, and the wdio-eslinter-service:

```
$ npm i eslint eslint-plugin-import wdio-eslinter-service --save-dev
```

Step 2 - Modify the "services" configuration key to include eslinter in wdio.conf.js:

```
services: ['chromedriver', 'eslinter'],
```

Step 3 - Modify package.json to add a run script for eslint. It should look like this:

```
    "scripts": {
      "test": "echo \"Error: no test specified\" && exit 1",
      "eslint": "eslint ."
    },
```

Step 4 - Add an .eslintrc.js configuration script:

```
// .eslintrc.js
module.exports = {
    "parserOptions": {
        "ecmaVersion": 2018
    },
    "plugins": [
        "import"
    ],
    "rules": {
        "import/no-unresolved": [
            2,
            {
                "commonjs": true,
                "amd": false,
                "caseSensitive": true
            }
        ]
    }
}
```

Now, when we run `npx wdio wdio.conf.js`, WebdriverIO will run eslint on the codebase to check for missing or incorrect require dependencies. 

## Configure the VSCode Debugger

The debugger lets us easily, and more quickly, determine why our code may not be running correctly.  To configure it, we will add the following code to our launch configurations:

```
           {
                // It's normal to see the wdio.*.conf.js loaded twice. See
                // https://github.com/webdriverio/webdriverio/issues/1500 
                // for explanation.
                "type": "node",
                "request": "launch",
                "name": "Debug WebdriverIO Tests Using Current Config",
                "port": 9229,
                "timeout": 1500000,
                "program": "${workspaceRoot}/node_modules/.bin/wdio",
                "cwd": "${workspaceRoot}",
                "console": "internalConsole",
                "env": {
                },
                "args": [
                    "${file}",
                    "--mochaOpts.timeout",
                    "1500000"
                    //"--spec",
                    //""
                    //""
                ]
            },
```

Step 1 - In VSCode, click "Run and Debug" in the left sidebar.

Step 2 - At the top of the sidebar, click the dropdown and click "Add Configuration..."

Step 3 - Inside the "configurations" array, paste the above launch configuration inside, and save the launch.json file.

This completes the setup. Now we will look at how to use the debugger:

Step 1 - Open a file where the error occurs.

Step 2 - In the left side of the file content are line numbers. To the left of each line number is blank space. Click to the left of the line number where you want execution to pause. You should see a red circle appear.

Step 3 - Before running the debugger, the configuration file we're using must be the active tab.  Click the wdio.conf.js tab to make it the active tab.

Step 4 - Click the Run/Debug dropdown (the same place where we clicked "Add Configuration...") and click on the "Debug WebdriverIO Using Current Config".

Step 5 - Click the green "run" button to the left of the dropdown.



## Configuring the tracer logger

console.log lets us see helpful information that we put inside the codebase. We can get more value out of logs if we can control what kind of logs we see, as well as when we can see the filename and line number where the log was printed. 

Here is a logger.js configuration file, which uses the tracer module as a replacement for console:

```
// logger.log - wrapper around tracer log library.

/**
 * Set the log level in specLogLevel in wdio.conf.js
 */
const level = typeof browser !== 'undefined' && browser.config && browser.config.specLogLevel
    ? browser.config.specLogLevel
    : 'debug'; //'debug'     // trace|debug|log|info|warn|error

const colors = require('colors');
const logFormatting = {
    format: '{{file}}:{{line}}: <{{title}}>: {{message}}',
    dateformat: 'HH:MM:ss.L',
    methods: ['trace', 'debug', 'log', 'info', 'warn', 'error'],
    filters: {
        log: colors.cyan,
        trace: colors.magenta,
        debug: colors.blue,
        info: colors.green,
        warn: colors.yellow,
        error: [colors.red, colors.bold]
    },
    level: module.parent == null ? 'trace' : level
};

const logger = require('tracer').colorConsole(logFormatting);

if (module.parent == null) {
    logger.trace('trace');
    logger.debug('debug');
    logger.log('log');
    logger.info('info');
    logger.warn('warn');
    logger.error('error');
}

module.exports = logger;
```

Step 1 - Copy the logger file into utils/logger.js and save the file.

Step 2 - Install the tracer module with `npm i tracer --save-dev`

Step 3 - We will add the dependency globally in wdio.conf.js.

```
    before: function (capabilities, specs) {
        global.logger = require('./utils/logger');
```

Step 4 - We will do a find/replace, using VSCode, to replace all of our console calls with logger calls.

Step 5 - To only show logs with level "log" and above, such as "log", "info", "warn", "error" but not "debug" and "trace", we add the specLogLevel to the wdio.conf.js above the "bail" setting:

```
    /**
     * Level of logging verbosity for the logger statements inside your spec files, 
     * page objects, and step files: // trace|debug|log|info|warn|error
     */
    specLogLevel: 'log',
```

To change the colors and see what they would look like, edit logger.js and then run `node utils/logger` to see a demo of the different log levels. This is possible thanks to `if (module.parent == null) {` which outputs an example of each log statement if the logger.js script is run independently, without being imported by another module.


## Slow mode

While debugging, sometimes the automation scripts move too fast for our brains to process what's happening.  Normally, we want the tests to run as quickly as possible, but if we're trying to troubleshoot a problem and find out why something isn't working, we need to see what is happening in the browser at a speed that is digestable to us humans. Using browser.throttle, we can slow down the network speed of the browser to force everything to move at a slower pace.

To make it easy to enable/disable without having to change the code, we'll use an environment variable to switch on slow mode. Let's put this code in the wdio.conf.js before hook:

```
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
```

Now, whenever we need the automation to slow down, we prepend the wdio command with SLOW_MODE=true, like so:

```
$ SLOW_MODE=true npx wdio --spec ./test-sync/specs/entry.ad.e2e.js
```

To run at full speed, just remove the SLOW_MODE=true environment variable.  Using environment variables for situations like this prevent us from accidentally deploying to our CI server and forgetting to disable slow mode. With this setup, we don't need to worry about that anymore.  What other areas could you use an environment variable so you don't need to modify your configuration file?  Think about that as we move into the next section.


## Setup Multi-Environment where URLs constantly change

Many tutorials instruct us to create a dev, staging, and production environment, each with fixed URLs, like `dev.example.com`, `staging.example.com` and `www.example.com`. However, Google Cloud Platform gives us an infinite number of URLs, a different one for each version of the application under test.  The traditional ways of configuring environments doesn't work well for those of us running applications on GCP.

For the-internet, the website we'll be running automation tests on, we have the production server, located at https://the-internet.herokuapp.com, and we have a staging instance, located at https://staging-the-internet.herokuapp.com.  Also, sometimes developers deploy to non-default staging URLs that look similar to https://login-dot-staging-the-internet.herokuapp.com.  We'll demonstrate how to handle these URLs.

First, we'll configure wdio.conf.js with an isLive helper method, where we define the URL patterns for all of our live servers.

```
function isLive() {
    if (typeof process.env.BASEURL === 'undefined')
        return true;

    const liveServerUrlPatterns = [
        'http[s]?://the-internet..*.com'
    ];
    return liveServerUrlPatterns.reduce((acc, url) => {
        if (process.env.BASEURL.match(url))
            return true;
        return acc;
    }, false);
}
```

The isLive helper matches the following URLs:
- `https://the-internet.herokuapp.com`
- `http://the-internet.herokuapp.com`
- `https://the-internet.blah.com`   // not valid, but it's here for demo purposes

Also note that, if we don't set the BASEURL environment variable and it's undefined, isLive returns true.

We'll also add a handy isNotLive helper method, because it makes the code more readable in cases where we need to check that we're not running on live:

```
function isNotLive() {
    return !isLive();
}
```


The isLive function references an environment variable called `BASEURL`. We'll modify the baseUrl property in wdio.conf.js so that, if this value is set, we'll use it instead of the default:

```
baseUrl: typeof (process.env.BASEURL) === 'undefined' ? 'https://the-internet.herokuapp.com' : process.env.BASEURL,
```

To run the tests on the insecure, http version of the-internet, we start the test runner as follows:

```
$ BASEURL=http://the-internet.herokuapp.com npx wdio
```

Whenever browser.url is called with a relative path, the domain will be this BASEURL instead of the default one set in wdio.conf.js.

If we need to run the tests on a non-default version, we simply pass in the URL for that version:

```
$ BASEURL=https://login-dot-staging-the-internet.herokuapp.com npx wdio
```

Also, if a developer deploys a build to https://fantastic-flavors-dot-the-internet.appspot.com, we need not edit any configuration files in order to run the tests. We simply pass in the URL in the environment variable, like so:

```
$ BASEURL=https://fantastic-flavors-dot-the-internet.appspot.com npx wdio
```

## Running the browser in Docker containers

When running the tests, we're using our local computer's Chrome browser. This makes it difficult to run the tests and also perform other tasks. In this section, we'll create a new configuration file that will run WebdriverIO tests on Chrome/Chromium headfully, but the browser will also run in a Docker container. 

This gives us the option to still watch and debug the tests by looking at the browser while also giving us the option to pretend like everything is running in the background.

A quick way to understand what Docker does is this:  _It let's us run a virtual computer, with its own operating system and applications, on our physical computer._ The physical computer is known as the host, while the virtual computers are often referred to as the guest, or in the Docker world, a container. 

To configure the tests to run using a Chrome browser running in a virtual Ubuntu/Debian instance, we'll create a configuration file called wdio.docker-service.conf.js, which will inherit from wdio.conf.js and also add configuration for the wdio-docker-service.  

```
// wdio.docker-service.conf.js

/*
 This configuration runs in docker, but headfully, meaning not headless.
 This configuration and its derivatives also allow passing the port WebdriverIO uses
 to connect to a WebDriver instance, and the same port is used to connect the host to
 the Docker container.

 From the WebdriverIO docs:
 $ npx wdio wdio.docker-service.conf.js -p 4445

 We can also override the default Docker image selenium/standalone-chrome-debug by 
 passing in as an argument:
 $ npx wdio wdio.docker-service.conf.js --image seleniarm/standalone-chromium:4.0.0-beta-1-20210215

 Note that this configuration automatically attempts to load seleniarm/standalone-chromium if 
 the script is run on the Mac M1.

 This also works for the derivative WebdriverIO configurations which use the wdio-docker-service.
*/

const SELENIUM_SERVER_PORT = getWdioPortArgument(process.argv);
const DOCKER_IMAGE = getDockerImageArgument(process.argv);


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


function argsValue(argsArr, shortForm, longForm, defaultValue) {
    return argsArr.reduce((acc, elem, index, array) => {
        if ((array[index - 1] === shortForm || array[index - 1] === longForm))
            acc = elem;
        return acc;
    }, defaultValue);
}
```

This configuration file also adds some custom functionality to help those on different platforms run the tests. The functionality also helps those who want to use a different selenium browser image to do so, without needing to modify the configuration file.  For example, many of you on Intel based machines will want to use the Docker image selenium/standalone-chrome-debug. But if you're on the Mac M1, you'll need to use virtualization images built for ARM64 processors.  In this configuration file, you'll see there is some code that checks the CPU model for the phrase "Apple M1". Based on whether or not that string is present determines whether or not the default image is selenium/standalone-chrome-debug or a custom image Mac M1 users must build themselves in order to run the tests.

Additionally, if you want to run tests on Firefox, there is a selenium/standalone-firefox-debug image we can pass in as an argument instead. Here is the command, if you'd like to run these tests on Firefox in Ubuntu:

```
$ npx wdio wdio.docker-service.conf.js --image selenium/standalone-firefox-debug:latest
```

### Building Selenium Docker Images for Mac M1

If you're on a Mac M1 or just want to know how we build these containers for ARM64 platforms, follow along in this sub-section:


Step 1 - Clone this repository https://github.com/jamesmortensen/docker-selenium

Create a build.sh file. (Windows users will need to use git bash terminal for this step):

```
VERSION=4.0.0-beta-2-20210622
NAMESPACE=local-seleniarm
AUTHORS=james

cd ./Base && docker buildx build --platform linux/arm64 -t $NAMESPACE/base:$VERSION .
echo $PWD
cd ../Hub && sh generate.sh $VERSION $NAMESPACE $AUTHORS \
   && docker buildx build --platform linux/arm64 -t $NAMESPACE/hub:$VERSION .

cd ../NodeBase && sh generate.sh $VERSION $NAMESPACE $AUTHORS \
   && docker buildx build --platform linux/arm64 -t $NAMESPACE/node-base:$VERSION .

cd ../NodeChromium && sh generate.sh $VERSION $NAMESPACE $AUTHORS \
   && docker buildx build --platform linux/arm64 -t $NAMESPACE/node-chromium:$VERSION .

cd ../Standalone && sh generate.sh StandaloneChromium node-chromium $VERSION $NAMESPACE $AUTHORS \
   && cd ../StandaloneChromium \
   && docker buildx build --platform linux/arm64 -t $NAMESPACE/standalone-chromium:$VERSION .

echo "Build node-hub, node-chromium, and standalone-chromium..."
```

This file will build Selenium Hub, Selenium Node with Chromium, and a Selenium Chromium image for the ARM64 platform. If you're on the Mac M1, run this script to start the build process:

```
$ sh build.sh
```

## WebdriverIO Debugging Powerhouse

With the tools we've installed and configured, we can now run the tests and fix some bugs.

First, we'll run all of the tests and look for problems. We'll use the Docker service so that WebdriverIO will start the container for us and so the browser stays isolated from our workspace:

```
$ npx wdio wdio.docker-service.conf.js
```

We can see there are failing tests. One of the failing tests is in dynamic.loading.1.e2e.js. We can see that we expected the value of an element on the page to equal "Hello World!" but instead is an empty string.

We also notice there are two pages that look identical, dynamic/1 and dynamic/2. They also appear to function exactly the same way, yet the test for dynamic1 fails while passing for dynamic2.

We look at the page objects and notice they are almost exactly identical. The only difference is the open method.  In DynamicLoading1, we open /dynamic_loading/1, but in DynamicLoading2, we see the open method opens the /dynamic_loading/2.  

Again, everything else looks exactly the same, and we see all this duplicated code.  The duplicate code was probably written to get tests written for page 2. This is the easiest kind of duplication to work with, since the two files have not diverged.

dynamic.loading.1.e2e.js
```
const logger = require('@utils/logger');
const LoginPage = require('../pageobjects/login.page');
const SecurePage = require('../pageobjects/secure.page');
const DynamicLoading1 = require('../pageobjects/dynamic.loading.1.page');


describe('Tests on waiting for an element to appear - 1', () => {

    it('should wait for the element to appear', () => {
        DynamicLoading1.open();

        DynamicLoading1.startButton.waitForClickable();
        DynamicLoading1.startButton.click();

        const helloText = DynamicLoading1.helloWorldElem.getText();
        expectChai(helloText).to.equal('Hello World!');
    })
});
```

dynamic.loading.2.e2e.js
```
const logger = require('@utils/logger');
const LoginPage = require('../pageobjects/login.page');
const SecurePage = require('../pageobjects/secure.page');
const DynamicLoading2 = require('../pageobjects/dynamic.loading.2.page');


describe('Tests on waiting for an element to appear - 2', () => {

    it('should wait for the element to appear', () => {
        DynamicLoading2.open();

        DynamicLoading2.startButton.waitForClickable();
        DynamicLoading2.startButton.click();

        const helloText = DynamicLoading2.helloWorldElem.getText();
        expectChai(helloText).to.equal('Hello World!');
    })
});
```

dynamic.loading.1.page.js
```
const logger = require('@utils/logger');
const Page = require('./page');

/**
 * sub page containing specific selectors and methods for a specific page
 */
class DynamicLoading1 extends Page {
    /**
     * define selectors using getter methods
     */
    get startButton() { return $('#start > button'); }
    get helloWorldElem() { return $('#finish > h4'); }

    /**
     * overwrite specifc options to adapt it to page object
     */
    open() {
        return super.open('dynamic_loading/1');
    }
}

module.exports = new DynamicLoading1();
```

dynamic.loading.2.page.js
```
const logger = require('@utils/logger');
const Page = require('./page');

/**
 * sub page containing specific selectors and methods for a specific page
 */
class DynamicLoading2 extends Page {
    /**
     * define selectors using getter methods
     */
    get startButton() { return $('#start > button'); }
    get helloWorldElem() { return $('#finish > h4'); }

    /**
     * overwrite specifc options to adapt it to page object
     */
    open() {
        return super.open('dynamic_loading/2');
    }
}

module.exports = new DynamicLoading2();
```

We confirm this, more scientifically, using diff to compare the files and output the differences:

```
$ diff dynamic.loading.1.page.js dynamic.loading.2.page.js 
18c18
<         return super.open('dynamic_loading/1');
---
>         return super.open('dynamic_loading/2');
```

The only differences in the tests are the class name used. The method signatures are identical.

Before we dig into why one fails and one passes, we'll refactor the code to eliminate the duplication, at least in the page objects.

We'll create a superclass to hold the selectors, and then each subclass will inherit the selectors but override the open method with their own implementation.  

dynamic.loading.pages.js
```
const logger = require('@utils/logger');
const Page = require('./page');

class DynamicLoading extends Page {
    /**
     * define selectors using getter methods
     */
    get startButton() { return $('#start > button'); }
    get helloWorldElem() { return $('#finish > h4'); }
}
```

dynamic.loading.1.page.js
```
const logger = require('@utils/logger');
const DynamicLoading = require('./dynamic.loading.pages');

/**
 * sub page containing specific selectors and methods for a specific page
 */
class DynamicLoading1 extends DynamicLoading {
    /**
     * overwrite specifc options to adapt it to page object
     */
    open() {
        return super.open('dynamic_loading/1');
    }
}

module.exports = new DynamicLoading1();
```

dynamic.loading.2.page.js
```
const logger = require('@utils/logger');
const DynamicLoading = require('./dynamic.loading.pages');

/**
 * sub page containing specific selectors and methods for a specific page
 */
class DynamicLoading2 extends DynamicLoading {
    /**
     * overwrite specifc options to adapt it to page object
     */
    open() {
        return super.open('dynamic_loading/2');
    }
}

module.exports = new DynamicLoading2();
```

We've refactored, and when rerunning the two spec files, we see that dynamic_loading/2 tests pass while dynamic_loading/1 still fails. Since we see the same behavior both before and after refactoring, we conclude that our refactoring didn't break anything but has instead simplified the code so we can get a clearer picture of what's happening.

Since the test code is the same, we conclude that the implementation is likely different in how the two pages are built.

In order to debug what's happening, we can mix automation with manual. We'll use the VSCode debugger to automatically take us through all the steps leading up to the point of failure, and then we'll pause the code execution. To do this, we'll place a breakpoint on the line that reads the hello world text.

1. In VSCode, verify that the tab in focus is for dynamic.loading.1.e2e.js. If it's not the focused tab, click that tab to focus it.  
2. In the left sidebar, click "Run and Debug".
3. In the dropdown in the Run and Debug panel, click "Debug WebdriverIO Tests Using _wdio.local.conf.js".
4. Click the green "play" button to the left of the dropdown. This starts the debugger.

We now should see VSCode pause the execution on the line that retrieves the text. In the browser, we see the loading bar, and after a few seconds, we see the text "Hello World!".  So why is the test failing? This is the question we need to answer.

The traditional method of solving the problem would be to edit the code, save the file, kill the running session, and restart the session from the beginning.  Instead, we'll use a faster approact. We'll use a couple code snippets to run some experiments in the browser, and some snippets to help us reset the state of the application to the point it was at prior to running the experiment.  We'll use the Debug Console to run the experiments. Here is the code snippet:

```javascript
DynamicLoading1.startButton.click();    DynamicLoading1.helloWorldElem.getText()
```

We are essentially going to run the same commands we see in the dynamic.loading.1.e2e.js file, but we're running them from the debug console so the paused breakpoint doesn't move from it's position.  Before we run the code snippet, we must first reset the application state so that we see the "Start" button and no Hello World text. Upon digging into the code, we see that "Hello world!" is initially hidden. There are two techniques we can use to reset the application state. 

1. Reload the page
2. Execute JavaScript code to hide the text and show the button.

The technique you use depends on the complexity of the feature, length of time to write reliable code to reset the state, and the feasability of simply refreshing the page.  Since this is a simple example, we can refresh the page. However, I want to use this opportunity to demonstrate how we can use code snippets to reset the state. This is useful in cases where refreshing alone wouldn't be sufficient, such as in cases where we'd need to go through a navigation flow to get back to the section we're debugging.  

Here is the code to reset the state. Note that it uses code that's injected directly into the browser with browser.execute, and it's very specific to this application under test. It also uses jQuery, which is also loaded on the page. If no jQuery existed, we would probably just use Vanilla JS:

```javascript
browser.execute(() => { $('#start').show(); $('#finish').hide(); });
```

We observe that the "Hello World!" text is hidden and the Start button is once again visible.  So now we'll run the experiment and observe what happens.

```javascript
DynamicLoading1.startButton.click();    DynamicLoading1.helloWorldElem.getText()
```

Sure enough, we see in the debug console that the line of code that retrieves the text has executed before the text appears. We see an empty string output by calling the `DynamicLoading1.helloWorldElem.getText()` method. 

Why is this? We'll use our up arrow key in the debug console to go back to the reset code snippet, and we'll run the experiment again, this time careful to watch both the log as well as the browser.

Another debugging technique is to use video recording software, such as Apple's QuickTime, to record both the browser and the log side by side. This technique is handy if we want to move backward in time and pause the visual state of the system and the log together.

In the video, we will pause shortly after clicking the Start button. Now, the problem is more clear. We see the progress bar is still loading, yet the getText method has already attempted to retrieve the text. Since the element is not visible, getText returns an empty string. 

It's also much more clear what we must do to fix the test. We'll insert some code to wait for the progress bar to disappear before we attempt to read the text. We'll also write this code in the debug console. This allows us to easily adjust our experiment without waiting for the entire test execution flow to restart from the beginning.

```
DynamicLoading1.startButton.click();

try {
    $('#loading').waitForExist({reverse: true});
} catch(e) {
    logger.error('Timeout occurred:  Loader did not disappear');
    DynamicLoading1.helloWorldElem.getText();
}
```

We won't use the try/catch in the production version, once we copy the solution to the spec file, but we'll use it here to keep WebdriverIO from timing out the test because of a waitFor timeout. In this case, we preserve control of the test flow and can continue debugging, without needing to restart the test runner.

After running, we see the loader did not disappear. We do notice that the getText method did receive "Hello World!", so we do know that waiting is the correct course of action. But now we need to deal with the waitTimeout, because without the try/catch, our test will break.

```
dynamic.loading.1.e2e.js:25:27), <anonymous>:7: <error>: Timeout occurred:  Loader did not disappear
'Hello World!'
```

When dealing with elements that are transient, meaning they appear for some time and then disappear, before we wait for them to disappear, we must first wait for them to appear. We can use two waitFor's together to wait for the appearance and then wait for the disappearance:

```
DynamicLoading1.startButton.click();

try {
    $('#loading').waitForExist({timeoutMsg: 'Loader did not appear'});
    $('#loading').waitForExist({reverse: true, timeoutMsg: 'Loader did not disappear'});
} catch(e) {
    logger.error('Timeout occurred:  Loader did not disappear');
    DynamicLoading1.helloWorldElem.getText();
}
```

But we still see the same problem:

```
dynamic.loading.1.e2e.js:25:27), <anonymous>:7: <error>: Timeout occurred:  Loader did not disappear
'Hello World!'
```

Upon further investigation in the application, we see the loader is not removed, it's just hidden with the CSS declaration `display:none`. Therefore, we'll use waitForDisplayed instead.

Also, note that we incorrectly placed the getText method call in the catch block, so we'll also move the getText call outside of the catch block:

```
DynamicLoading1.startButton.click();

try {
    $('#loading').waitForExist({timeoutMsg: 'Loader did not appear'});
    $('#loading').waitForDisplayed({reverse: true, timeoutMsg: 'Loader did not disappear'});
} catch(e) {
    logger.error('Timeout occurred:  Loader did not disappear');
}

DynamicLoading1.helloWorldElem.getText();
```

We now see our 'Hello World!' text returned back in the console, and there are no errors, caught or uncaught.

Now that we're confident that we found the solution, we'll transfer this solution to dynamic.loading.1.e2e.js. We'll also remove the try/catch block. If something goes wrong with the loader in the application, we want the test runner to report this properly and stop executing the test.

We now see the tests passing. We also had an opportunity to see what the error messages look like when something goes wrong. We added in a custom timeoutMsg for waiting for the loader to exist as well as waiting for the loader to disappear. This is helpful information six months from now, when we've all forgotten how the code works. 

The error handling part is the most important. This test passes now, but at some point in the future, it will break and will need maintenance, so we'll take a moment to quickly review the error messages to make sure we're not missing anything.

One thing to note is the language we're using. The timeoutMsg uses the terms "disappear" and "appear", but the first waitFor is about whether or not the element exists or not. 

This subtle use of language could inadvertently lead us down the wrong trail later in the future, as seeing "appear" and "disappear" may trick our brain into thinking we're waiting for elements to appear and disappear. So what we'll do is use the same terms in the timeout messages so they match the waitFor method we're using. In the waitForExist timeout message, we'll say the "Loader did not come into existence" so it's really clear to the engineer who debugs this in the future to think about "existence" not "displayed/not displayed":

```javascript
$('#loading').waitForExist({ timeoutMsg: 'Loader did not come into existence' });
$('#loading').waitForDisplayed({ reverse: true, timeoutMsg: 'Loader did not disappear' });
```

If we were checking to see whether or not an element was clickable or not, we would use the term "clickable" instead. It's always a good practice to use terminology that best reflects what the code is trying to do.

Below is the final version of our test:

```
    it('should wait for the element to appear', () => {
        DynamicLoading1.open();

        DynamicLoading1.startButton.waitForClickable();
        DynamicLoading1.startButton.click();

        $('#loading').waitForExist({ timeoutMsg: 'Loader did not come into existence' });
        $('#loading').waitForDisplayed({ reverse: true, timeoutMsg: 'Loader did not disappear' });

        const helloText = DynamicLoading1.helloWorldElem.getText();
        expectChai(helloText).to.equal('Hello World!');
        //expect(DynamicLoading1.helloWorldElem).toBeDisplayed();
    })
```

There is still another issue to deal with. After working with dynamic_loading/1, we may be wondering why the same test in dynamic_loading/2 passed and didn't fail. Not wanting to leave any stones unturned, we'll investigate why the test is passing in this second test file.

We'll use the debugger and place the breakpoint in the same location, right before we grab the Hello World text. Once the debugger stops execution, we'll refresh the page and paste the same working code we used for the first page in the debug console for the second page, with some modifications:

```
ynamicLoading2.startButton.click();

try {
    $('#loading').waitForExist({timeoutMsg: 'Loader did not appear'});
    $('#loading').waitForDisplayed({reverse: true, timeoutMsg: 'Loader did not disappear'});
} catch(e) {
    logger.error('Timeout occurred:  Loader did not disappear');
    
}
DynamicLoading2.helloWorldElem.getText();
```

The difference is the class name. We're calling the methods for DynamicLoading2 instead of DynamicLoading1.

When running the code, we see the output "Hello World!" in the logs, with no errors. But let's investigate, using Chrome Dev Tools, to find out why it passes without the waits.

Upon investigating, we see that the text isn't just hidden like on page 1. It's not there at all. When we click the "Start" button, we see that the `<div id="finish">` element is added after the loader disappears.

So still we may have the original question to answer, which is "Why did the original test for page 2 pass?"  To gather more information, we'll go back to the original experiment we ran on page 1, but we'll modify it for page 2:

```javascript
DynamicLoading2.startButton.click();    DynamicLoading2.helloWorldElem.getText()
```

We'll use QuickTime to take another video, and we'll analyze the results. In the video, we see different behavior for the same code running on page 2 than on page 1. In this case, the getText method appears to be waiting before returning the "Hello World!" text.  Why is that?

The behavior of getText implies that there is perhaps a waitForExist behavior implemented inside it. Let's run a quick experiment in the debug console:

```
$('#finish > h4').isExisting()
false
```

We see the method isExisting returns false. The element is not found on the page, so let's call getText and see what happens:

```
$('#finish > h4').getText();
Uncaught Error: Can't call getText on element with selector "#finish > h4" because element wasn't found
```

We get an error message, but it takes 10 seconds for it to appear. We know that our wdio.conf.js file has a configuration setting to specify the waitFortimeout. Let's change it to 3000 and restart the debugger.

Running the same experiments again shows the error appears after 3 seconds, confirming that there is a waitForExist implementation.

How do we know it's a waitForExist and not a waitForDisplayed?  We know this based on what we observed in page 1's tests. Let's quickly run the same tests there to see what happens when we call getText before clicking start. To do this, we'll change the url manually to page 1, and then run the code in the debugger.

```
$('#finish > h4').getText();
''
```

Our hypothesis is confirmed. When running getText when an element is merely hidden, as opposed to not existing, results in the getText method returning an empty string. 

Does this seem like odd behavior? It does now that we've compared the two. When getText is called on a hidden element, empty string is returned, but if it's called on an element that doesn't exist, we get an UncaughtError saying the element wasn't found. 

Shouldn't getText on a hidden element either give us the text or throw an error instead? That's really up to the core WebdriverIO or Selenium developers to answer, but it seems that returning empty string could also be interpreted as a visible element that's empty instead of one that's just hidden.

In this case, we can still rely on the code we wrote for page 1 in page 2, because the waitForDisplayed method call ensures that we only call getText when we know the element is visible. This works in both scenarios, regardless of whether the element is invisible or not existing.

The current getText method behavior can mislead us. For this use case, and other use cases where we care only about visibility, it would be better to have a method that only returned a valid string if the element is visible. 

One possible solution is to write our own method that will first check for the element's existence prior to calling getText. We'll call it getTextOnlyIfVisible. We'll place our custom method in the wdio.conf.js file inside the before hook.

```
browser.addCommand('getTextOnlyIfVisible', function () {
    if (this.isDisplayed())
        return this.getText();
    else
        throw new Error('Cannot get text of element because element is not visible.');
}, true);
```

Here is another example implementation where we wait for the element to be displayed and then retrieve the text:

```
browser.addCommand('waitUntilVisibleThenGetText', function () {
    this.waitForDisplayed({ timeoutMsg: 'Cannot get text. Element did not become visible before the timeout of ' + browser.config.waitforTimeout });
    return this.getText();
}, true);

How is this different from the previous example? In the previous example, we are checking the visibility status and immediately deciding whether to then get the text or throw an error. There is no waiting in the first example. Note how I'm also careful to use the waitFor or waitUntil naming convention with any methods I create that will do any kind of waiting. This will help others better understand the custom method.

Moreover, we can create more custom commands, if needed, but a good rule of thumb is only add them as element/browser commands if they're generic/general enough for widespread usage across the test app.  For more specific cases where we're referring to specific selectors, use page objects instead. For more information on custom commands, see the WebdriverIO documentation on [Custom Commands](https://webdriver.io/docs/customcommands).