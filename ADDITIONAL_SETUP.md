## Enable Absolute Paths with Module Alias

Imports can get messy with relative paths, like `../../utils/logger`. Instead, we'll install a module alias tool and then create references, or aliases, to folder paths as absolute paths. To do this, we need to install `module-alias`, write a configuration script with our aliases, then create a jsconfig.json to continue using VSCode intellisense with imported modules.  Afterwards, we'll modify .eslintrc.js so that eslint also understands how to work with the module aliases when resolving paths. Lastly, we need to load the module-aliases.js configuration script as the first thing we do in wdio.conf.js.

Step 1:

```
$ npm i module-alias eslint-import-resolver-custom-alias --save-dev
```

Step 2:

Add module-aliases.js to the root of the project:

```
/**
 * module-aliases.js - This is where we configure aliases so the project can run
 * jsconfig.json - This is where we configure aliases for vscode Intellisense.
 * 
 * This enables us to use shortcuts like:
 * 
 *  require('@utils/logger');
 */

const moduleAlias = require('module-alias')

//
// Register alias
//
//moduleAlias.addAlias('@utils', __dirname + '/src/client')

// Or multiple aliases
moduleAlias.addAliases({
    '@utils': __dirname + '/utils',
    '@specs': __dirname + '/test-sync/specs',
    '@pageobjects': __dirname + '/test-sync/pageobjects',
    '@': __dirname + '/'
});

 // Custom handler function (starting from v2.1)
 // moduleAlias.addAlias('@src', (fromPath, request, alias) => {
 //     // fromPath - Full path of the file from which `require` was called
 //     // request - The path (first argument) that was passed into `require`
 //     // alias - The same alias that was passed as first argument to `addAlias` (`@src` in this case)

 //     // Return any custom target path for the `@src` alias depending on arguments
 //     if (fromPath.startsWith(__dirname + '/others')) return __dirname + '/others'
 //     return __dirname + '/src'
 // })

 //
 // Register custom modules directory
 //
 // moduleAlias.addPath(__dirname + '/node_modules_custom')
 // moduleAlias.addPath(__dirname + '/src')

 //
 // Import settings from a specific package.json
 //
 //moduleAlias(__dirname + '/package.json')

 // Or let module-alias to figure where your package.json is
 // located. By default it will look in the same directory
 // where you have your node_modules (application's root)
 //moduleAlias()
```

Step 3:

Create a jscconfig.json file with the module aliases:

```
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@utils/*": ["utils/*"],
      "@specs/*": ["test-sync/specs/*"],
      "@pageobjects/*": ["test-sync/pageobjects/*"],
      "@/*": ["./*"]
    }
  },
  "exclude": ["node_modules", "dist"]
}
```

Step 4:

Add the aliases to the .eslintrc.js script so eslint understands the aliases. Insert it right below the `module.exports` line:

```
"settings": {
        "import/resolver": {
            "eslint-import-resolver-custom-alias": {
                "alias": {
                    "@utils": "./utils",
                    "@specs": "./test-sync/specs",
                    "@pageobjects": "./test-sync/pageobjects",
                    "@": "./"
                }
            }
        }
    },
```

Step 5:

In wdio.conf.js, load the module-aliases.js script at the very beginning of the file:

```
require('./module-aliases');
```

Step 6: 

Run `npx wdio` to confirm there are no errors to troubleshoot.


## the-internet on Docker

If we have the-internet running locally, we can also run the tests on our local machine too by passing in the localhost URL:

```
$ BASEURL=http://localhost:9292 npx wdio
```

Now, most of you have Node.js installed, but you may not have Ruby installed.  the-internet is a Ruby Sinatra application. But using the power of Docker, we can setup our dev environment with one command.  Let's get our own dockerized copy of the-internet.

Step 1 - Start the Docker Engine. Go to Step 2 while waiting for the engine to start.

Step 2 - Clone the repository

```
$ git clone https://github.com/jamesmortensen/the-internet
```

Step 3 - Build a Docker image with the dependencies and the-internet codebase

```
$ docker build -t local/the-internet:latest .
```

Step 4 - Start a disposable container on port 5000

```
$ docker run --rm -p 5000:5000 local/the-internet:latest
```

Step 5 - Go to http://localhost:5000 to see the Dockerized the-internet

Step 6 - Run the WebdriverIO e2e tests entirely on the local machine, using Docker:

```
$ BASEURL=http://localhost:5000 npx wdio 
```

With this setup, we can work without Wifi being enabled. At some point, try disabling your wifi. Since the app is running locally, you can still test it.


## Running Tests against the Dockerized App using selenium/standalone-chrome or seleniarm/standalone-chromium

Step 1 - In one terminal tab, start the-internet on Docker. This time, we'll expose port 7080 on the host side and direct that traffic to port 5000 in the container:

```
$ docker run --rm -p 7080:5000 local/the-internet:latest
```

Step 2 - In another terminal tab, pass in the BASEURL and run wdio with the docker configuration file passed in as an argument:

```
$ BASEURL=http://localhost:7080 npx wdio wdio.docker-app-headful.conf.js
```

In step 2, we observe that the selenium/standalone-chrome-debug container (or local-seleniarm/standalone-chromium for those on Mac M1) cannot reach localhost:5000. This is because localhost maps to the container's IP address, not the host. In the Chrome container, there is no Ruby Sinatra server running on localhost; it's in the other Docker container.

To connect the Chrome container to the application container, we'll add a host to the hosts file on the Chrome container, which maps to our host IP address, since port 7080 forwards traffic to the app container, any requests made to the custom hostname and port will route to the other container.  

Step 3 - Write a Docker-detection function and a custom hostname to the Docker Configuration

Docker has an argument called `--add-host` which we can use to add a custom hostname to a Docker container.  For example, this allows the Chrome container to reach the application via `http://local.the-internet:7080`:  

Let's add the following code to the wdio.docker-headful.conf.js file, right above the overwriteMerge constant. If the app is running in docker, then we'll add the custom hostname and map it to the host IP address:

```
if (appIsRunningOnDocker())
    config.override.dockerOptions.options.addHost = `${appHostname}:${networkInfo.address}`;
```

We'll also need to add the `appIsRunningOnDocker()` function right below the if statement:

```
function appIsRunningOnDocker() {
    return ['5000', '7080', '8080', '8888'].reduce((portFound, port) => {
        return portFound ? portFound : config.default.baseUrl.includes(port);
    }, false);
};
```

This lets us specify ports where we should assume Docker will need to add a custom hostname and point it back to the host's IP address.  We add an array of commonly used local ports, as well as a callback function which returns true if one of the ports matches the port in the baseUrl.

Step 4 - Use the wdio-docker-service to manage starting/stopping the Chrome container.

wdio.docker-app-headful.conf.js uses the wdio-docker-service, which WebdriverIO uses to start and stop the Chrome container.  Let's run the tests:

```
$ BASEURL=http://local.the-internet:7080 npx wdio wdio.docker-app-headful.conf.js
```

Using VNC Viewer, we can remote desktop into the container at localhost:5900 and see what's happening with the browser. Instead of loading `http://localhost:7080`, we see the browser is loading `http://local.the-internet:7080`

Also, the platform logic works. Those on Intel machines may notice Chrome loading in the container, while those on the Mac M1 may notice Chromium loading instead. 

### Troubleshooting:

If you want to start the container without WebdriverIO, you can do so with this command:

```
$ docker run --rm --add-host=local.the-internet:`ipconfig getifaddr en0` --shm-size 3g selenium/standalone-chrome-debug:latest
```

The `ipconfig getifaddr en0` gets your local machine's IP address and replaces itself with a string in the above command. It's the same as doing this:

```
$ ipconfig getifaddr en0
10.3.1.2
$ docker run --rm --add-host=local.the-internet:10.3.1.2 --shm-size 3g selenium/standalone-chrome-debug:latest
```

It's just substituting the result of that command into the docker run command, and it's dynamic, meaning it works regardless of the IP address and doesn't require continuously editing the command.


