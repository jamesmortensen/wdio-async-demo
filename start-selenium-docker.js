#!/usr/bin/env node
const { spawn } = require('child_process');


function getWdioPortArgument(argsArr) {
    return argsValue(argsArr, '-p', '--port', '4444');
}

function getVncPortArgument(argsArr) {
    return argsValue(argsArr, '-n', '--vnc', '5900');
}

function getDockerImageArgument(argsArr) {
    const os = require('os');
    return argsValue(argsArr, '-i', '--image',
        !os.cpus()[0].model.includes('Apple M1')
            ? 'selenium/standalone-chrome-debug'
            : 'local-seleniarm/standalone-chromium:4.0.0-beta-2-20210622');
}

function getHelpArgument(argsArr) {
    return argsArr.includes('-h') || argsArr.includes('--help');
}

function argsValue(argsArr, shortForm, longForm, defaultValue) {
    return argsArr.reduce((acc, elem, index, array) => {
        if ((array[index - 1] === shortForm || array[index - 1] === longForm))
            acc = elem;
        return acc;
    }, defaultValue);
}

if (getHelpArgument(process.argv)) {
    console.log(`
Usage: 
    ./start-selenium-docker.js [[-h|--help] | [-i|--image IMAGE_REF] | [-p|--port WD_PORT] | [-n|--vnc VNC_PORT]]

    -h -> Help (this output)
    -i -> Docker Image and Tag (default selenium/standalone-chrome-debug)
    -p -> Webdriver/Selenium port (default 4444)
    -n -> VNC Port (default 5900)

    `);
    process.exit(0);
}

const SELENIUM_PORT = getWdioPortArgument(process.argv);
const VNC_PORT = getVncPortArgument(process.argv);
const IMAGE = getDockerImageArgument(process.argv);

const cmd = `docker run --rm -p ${SELENIUM_PORT}:4444 -p ${VNC_PORT}:5900 --shm-size 3g ${IMAGE}`;

console.log(cmd);

module.exports = function () {
    return new Promise((resolve, reject) => {
        const process = spawn(cmd.split(' ')[0], cmd.split(' ').filter((arg, index) => { if (index != 0) return arg; }), { stdio: "inherit" });

        process.on('close', (code) => {
            if (code !== 0)
                reject(code);
            else
                resolve(code);
        });
    });
}

if (process.argv[1] === __filename)
    module.exports(cmd);