// allure-environment.js
return;
const logger = require('@utils/logger');

function configureAllureEnvironment() {
    const reporter = require('@wdio/allure-reporter').default;
    if (process.argv.length > 2)
        reporter.addEnvironment('WDIO Config Filename', process.argv[2].substr(0, 2) === '--' ? 'wdio.conf.js' : process.argv[2]);
    else
        reporter.addEnvironment('WDIO Config Filename', 'wdio.conf.js');
    reporter.addEnvironment('Platform', process.arch + ' ' + process.platform);
    reporter.addEnvironment('Node.js Version', process.version);
    reporter.addEnvironment('baseUrl', global.browser.config.baseUrl);
    if (global.browser.config.dockerOptions)
        reporter.addEnvironment('Docker Image', global.browser.config.dockerOptions.image);

    return new Promise((resolve) => {
        const gitBranch = getBranchNameFromGit();
        if (gitBranch === undefined) {
            reporter.addEnvironment('git-branch', 'git not installed');
            resolve();
        }


        gitBranch.stdout.on('data', (data) => {
            reporter.addEnvironment('git-branch', data.toString());
            resolve();
        });

        gitBranch.stderr.on('data', (data) => {
            logger.error(`stderr - gitBranch: ${data}`);
            resolve();
        });

        gitBranch.on('error', (err) => {
            if (fileNotFound(err))
                reporter.addEnvironment('git-branch', 'git not installed');
            else
                logger.error(err);
        })
    });

    function getBranchNameFromGit() {
        const spawn = require('child_process').spawn;
        try {
            return spawn('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
        } catch (e) {
            logger.error('This should never execute: ' + e);
        }
    }

    function fileNotFound(err) {
        return err.code === 'ENOENT';
    }
}

module.exports = configureAllureEnvironment;